import { assert } from "console";
import { Archive } from "./Archive";
import { functionCommands } from "./Builder";

/**
 * Name used to access a property or an array element
 */
export type Name = string | number;

export interface Context {
  obj: { [id: string]: any };
  tmp: { [id: string]: any };
  locals: { [id: string]: any };
  parent?: Context;
  isLoading: boolean;
  path: string;
}

// Generate global ids for all commands
let __veryGlobalId: number = 0;
function genCmdId(): number {
  return __veryGlobalId++;
}

/*
if name starts with _ it's a temporary variable
  all temporary variables except for _index can be overwritten by the callee when calling functions
  and are not safe to use after a function call, etc.

if name starts with # it's a redirection
 -> #_index reads the value from the _index variable and sets/gets at that location
*/
export enum ReferenceType {
  OBJ, //
  TMP, // _
  INDIRECT_OBJ, // #
  INDIRECT_TMP // #_
}
export interface Reference {
  type: ReferenceType;
  name: string;
}

function buildReference(name: Name): Reference {
  let str = name.toString();

  let type = ReferenceType.OBJ;

  switch (str[0]) {
    case "#":
      if (str[1] === "_") {
        type = ReferenceType.INDIRECT_TMP;
      } else {
        type = ReferenceType.INDIRECT_OBJ;
      }
      break;
    case "_":
      type = ReferenceType.TMP;
      break;
  }

  return {
    type: type,
    name: str
  };
}

function setVar(ctx: Context, name: Name, value: any): void {
  switch (name.toString().charAt(0)) {
    case "#":
      ctx.obj[getVar(ctx, name.toString().substring(1))] = value;
      break;
    case "_":
      ctx.tmp[name] = value;
      break;
    default:
      ctx.obj[name] = value;
      break;
  }
}

function getVar(ctx: Context, name: Name): any {
  switch (name.toString().charAt(0)) {
    case "#":
      return ctx.tmp[getVar(ctx, name.toString().substring(1))];
    case "_":
      return ctx.tmp[name];
    default:
      return ctx.obj[name];
  }
}

export abstract class Command {
  protected id: number;
  private location: string;

  constructor() {
    this.id = genCmdId();
    this.location = new Error().stack!.split("\n")[4].split("at ")[1];
  }
  /**
   * Executes this command
   * Returns the number of bytes this function needs to complete
   * or -1 to indicate that the command pointer should not advance (only useful if the newStackFrameCallback was called)

   */
  abstract exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void,
    dropStackFrameCallback: () => void
  ): number;
}

export class EnterObjectCommand extends Command {
  private name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  exec(ctx: Context): number {
    if (ctx.isLoading) {
      // Make sure the object is created
      if (ctx.obj[this.name] === undefined) {
        ctx.obj[this.name] = {};
      }
    } else {
    }

    // Descend to the child object
    ctx.parent = {
      obj: ctx.obj,
      tmp: ctx.tmp,
      parent: ctx.parent,
      isLoading: ctx.isLoading,
      path: ctx.path,
      locals: ctx.locals
    };
    ctx.obj = ctx.obj[this.name];
    ctx.path = ctx.path + "." + this.name;
    return 0;
  }
}

export class LeaveObjectCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an object?
    ctx.obj = ctx.parent!.obj;
    ctx.tmp = ctx.parent!.tmp;
    ctx.path = ctx.parent!.path;
    ctx.parent = ctx.parent!.parent;

    return 0;
  }
}

export class EnterArrayCommand extends Command {
  private name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  exec(ctx: Context): number {
    if (ctx.isLoading) {
      // Make sure the array is created
      if (ctx.obj[this.name] === undefined) {
        ctx.obj[this.name] = [];
      }
    } else {
    }

    // Descend to the child array
    ctx.parent = {
      obj: ctx.obj,
      tmp: ctx.tmp,
      parent: ctx.parent,
      isLoading: ctx.isLoading,
      path: ctx.path,
      locals: ctx.locals
    };
    ctx.obj = ctx.obj[this.name];
    ctx.path = ctx.path + "." + this.name;
    return 0;
  }
}

export class LeaveArrayCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an array?
    ctx.obj = ctx.parent!.obj;
    ctx.tmp = ctx.parent!.tmp;
    ctx.path = ctx.parent!.path;
    ctx.parent = ctx.parent!.parent;
    return 0;
  }
}

export class EnterElemCommand extends Command {
  private index: Name;
  constructor(index: Name) {
    super();
    this.index = index;
  }

  exec(ctx: Context): number {
    const index = getVar(ctx, this.index);

    if (ctx.isLoading) {
      // Make sure the array element is created
      if (ctx.obj[index] === undefined) {
        ctx.obj[index] = {};
      }
    } else {
    }

    // Descend to the child array
    ctx.parent = {
      obj: ctx.obj,
      tmp: ctx.tmp,
      parent: ctx.parent,
      isLoading: ctx.isLoading,
      path: ctx.path,
      locals: ctx.locals
    };
    ctx.obj = ctx.obj[index];
    ctx.path = ctx.path + "[" + index + "]";
    return 0;
  }
}

export class LeaveElemCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an element?
    ctx.obj = ctx.parent!.obj;
    ctx.tmp = ctx.parent!.tmp;
    ctx.path = ctx.parent!.path;
    ctx.parent = ctx.parent!.parent;
    return 0;
  }
}

export class IntCommand extends Command {
  private ref: Reference;
  private defaultValue?: (ctx: Context) => number;
  private shouldCount: boolean;
  constructor(
    name: Name,
    defaultValue?: (ctx: Context) => number,
    shouldCount: boolean = true
  ) {
    super();
    this.ref = buildReference(name);
    this.defaultValue = defaultValue;
    this.shouldCount = shouldCount;
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformInt(
      ctx,
      this.ref,
      this.shouldCount,
      this.defaultValue
    );
    if (!result) {
      return ar.missingBytes;
    }
    return 0;

    /*    if (ctx.isLoading) {
      const result = ar.readInt(this.shouldCount);
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      return 0;
    } else {
      const value = getVar(ctx, this.name);

      ar.writeInt(value, this.shouldCount);

      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class StrCommand extends Command {
  private ref: Reference;
  private shouldCount: boolean;
  constructor(name: Name, shouldCount: boolean) {
    super();
    this.ref = buildReference(name);
    this.shouldCount = shouldCount;
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformStr(ctx, this.ref, this.shouldCount);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;

    /*    if (ctx.isLoading) {
      const result = ar.readStr(this.shouldCount);
      if (result === undefined) {
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class LongCommand extends Command {
  private ref: Reference;
  constructor(name: Name) {
    super();
    this.ref = buildReference(name);
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformLong(ctx, this.ref, true);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;

    /*    if (ctx.isLoading) {
      const result = ar.readLong();
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class ByteCommand extends Command {
  private ref: Reference;
  private shouldCount: boolean;
  constructor(name: Name, shouldCount: boolean) {
    super();
    this.ref = buildReference(name);
    this.shouldCount = shouldCount;
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformByte(ctx, this.ref, this.shouldCount);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*
    if (ctx.isLoading) {
      const result = ar.readByte(this.shouldCount);
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class FloatCommand extends Command {
  private ref: Reference;
  constructor(name: Name) {
    super();
    this.ref = buildReference(name);
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformFloat(ctx, this.ref, true);
    if (!result) {
      return ar.missingBytes;
    }

    return 0;
    /*
    if (ctx.isLoading) {
      const result = ar.readFloat();
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class AssertNullByteCommand extends Command {
  private shouldCount: boolean;
  constructor(shouldCount: boolean) {
    super();
    this.shouldCount = shouldCount;
  }

  exec(ctx: Context, ar: Archive): number {
    const result = ar.assertNullByte(ctx, this.shouldCount);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*
    if (ctx.isLoading) {
      const result = ar.readByte(this.shouldCount);
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      const zero = result;
      if (zero !== 0) {
        throw new Error(`Byte not 0, but ${zero}`);
      }
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class HexCommand extends Command {
  private ref: Reference;
  private bytes: number;
  private shouldCount: boolean;
  constructor(name: Name, bytes: number, shouldCount: boolean) {
    super();
    this.ref = buildReference(name);
    this.bytes = bytes;
    this.shouldCount = shouldCount;
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformHex(ctx, this.ref, this.bytes, this.shouldCount);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*
    if (ctx.isLoading) {
      const result = ar.read(this.bytes, this.shouldCount);
      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result.toString("hex"));
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class LoopHeaderCommand extends Command {
  private times: Name;
  constructor(times: Name) {
    super();
    this.times = times;
  }
  exec(ctx: Context): number {
    const iterations = getVar(ctx, this.times);
    ctx.locals.times = iterations;
    // reset the _index loop variable
    ctx.locals.index = -1;
    return 0;
  }
}

export class LoopBodyCommand extends Command {
  private loopBodyCommands: Command[];
  constructor(loopBodyCommands: Command[]) {
    super();
    this.loopBodyCommands = loopBodyCommands;
  }
  exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void
  ): number {
    ctx.locals.index++;
    ctx.tmp._index = ctx.locals.index;

    if (ctx.locals.index < ctx.locals.times) {
      newStackFrameCallback(this.loopBodyCommands);
      // pls keep the current command pointer the same, so that we can execute the next iteration
      return -1;
    } else {
      ctx.tmp._index = undefined;
      // continue after the loop
      return 0;
    }
  }
}

export class CondCommand extends Command {
  private cond: (ctx: Context) => boolean;
  private thenCommands: Command[];
  private elseCommands?: Command[];
  constructor(
    cond: (ctx: Context) => boolean,
    thenCommands: Command[],
    elseCommands?: Command[]
  ) {
    super();
    this.cond = cond;
    this.thenCommands = thenCommands;
    this.elseCommands = elseCommands;
  }
  exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void
  ): number {
    const result = this.cond(ctx);
    //console.log(`----------COND: ${result}`);
    if (result) {
      // execute then branch
      newStackFrameCallback(this.thenCommands);
    } else if (this.elseCommands !== undefined) {
      // execute else branch
      newStackFrameCallback(this.elseCommands);
    }
    return 0;
  }
}

export class CallCommand extends Command {
  private name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }
  exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void
  ): number {
    if (functionCommands[this.name] === undefined) {
      throw new Error(`No commands build for function ${this.name}`);
    }
    newStackFrameCallback(functionCommands[this.name]);
    return 0;
  }
}

export class ExecCommand extends Command {
  private code: (ctx: Context) => void;
  constructor(code: (ctx: Context) => void) {
    super();
    this.code = code;
  }
  exec(ctx: Context, ar: Archive): number {
    this.code(ctx);
    return 0;
  }
}

export class BufferStartCommand extends Command {
  private ref: Reference;
  private resetBytesRead: boolean;
  constructor(name: Name, resetBytesRead: boolean) {
    super();
    this.ref = buildReference(name);
    this.resetBytesRead = resetBytesRead;
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.startBuffer(ctx, this.ref, this.resetBytesRead);
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*
    if (ctx.isLoading) {
      const result = ar.readInt();
      if (result === undefined) {
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result);
      if (this.resetBytesRead) {
        ar.resetBytesRead();
      }

      // TODO preload the next ${result} bytes?
    } else {
      // TODO writing
      throw Error("Unimplemented");
    }
    return 0;
    */
  }
}

export class BufferEndCommand extends Command {
  exec(ctx: Context, ar: Archive): number {
    const result = ar.endBuffer();
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*if (ctx.isLoading) {
    } else {
      // TODO writing
      throw Error("Unimplemented");
    }
    return 0;*/
  }
}

export class HexRemainingCommand extends Command {
  private ref: Reference;
  private lengthRef: Reference;
  constructor(name: Name, lengthVar: Name) {
    super();
    this.ref = buildReference(name);
    this.lengthRef = buildReference(lengthVar);
  }
  exec(ctx: Context, ar: Archive): number {
    const result = ar.transformHexRemaining(
      ctx,
      this.ref,
      this.lengthRef,
      true
    );
    if (!result) {
      return ar.missingBytes;
    }
    return 0;
    /*
    if (ctx.isLoading) {
      const length = getVar(ctx, this.lengthVar);
      const result = ar.readUntil(length);

      if (result === undefined) {
        // return the amount of missing bytes
        return ar.missingBytes;
      }
      setVar(ctx, this.name, result.toString("hex"));
      return 0;
    } else {
      // TODO writing
      throw Error("Unimplemented");
      return 0;
    }*/
  }
}

export class SwitchCommand extends Command {
  private name: Name;
  private cases: { [id: string]: Command[] };
  constructor(name: Name, cases: { [id: string]: Command[] }) {
    super();
    this.name = name;
    this.cases = cases;
  }
  exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void
  ): number {
    const value = getVar(ctx, this.name).toString();
    //console.log(`Fetch ${value}`);

    if (this.cases[value] !== undefined) {
      newStackFrameCallback(this.cases[value]);
    } else if (this.cases["$default"] !== undefined) {
      newStackFrameCallback(this.cases["$default"]);
    } else {
      console.warn(`No case found for ${value} and no default case provided`);
    }
    return 0;
  }
}

export class BreakCommand extends Command {
  exec(
    _context: Context,
    _ar: Archive,
    _newStackFrameCallback: (commands: Command[]) => void,
    dropStackFrameCallback: () => void
  ): number {
    dropStackFrameCallback();
    return 0;
  }
}

export class DebuggerCommand extends Command {
  exec(
    _context: Context,
    _ar: Archive,
    _newStackFrameCallback: (commands: Command[]) => void,
    dropStackFrameCallback: () => void
  ): number {
    debugger;
    return 0;
  }
}

export class StartCompressionCommand extends Command {
  exec(
    _context: Context,
    _ar: Archive,
    _newStackFrameCallback: (commands: Command[]) => void,
    dropStackFrameCallback: () => void
  ): number {
    // to break the while loop and let the compression kick in
    return -2;
  }
}

export class EndSaveGameCommand extends Command {
  exec(
    ctx: Context,
    ar: Archive,
    newStackFrameCallback: (commands: Command[]) => void,
    dropStackFrameCallback: () => void
  ): number {
    ar.endSaveGame();
    return -3;
  }
}
