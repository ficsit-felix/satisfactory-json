import { assert } from 'console';
import { Chunk } from './Chunk';

/**
 * Name used to access a property or an array element
 */
export type Name = string | number;

export interface Context {
  obj: { [id: string]: any };
  vars: { [id: string]: any };
  parent?: Context;
  isLoading: boolean;
}

// Generate global ids for all commands
let __veryGlobalId: number = 0;
function genCmdId(): number {
  return __veryGlobalId++;
}


/*
if name starts with _ it's a private variable
if name starts with # it's a redirection
 -> #_index reads the value from the _index variable and sets/gets at that location
*/

function setVar(ctx: Context, name: Name, value: any): void {
  if (name.toString().charAt(0) === '#') {
    ctx.vars[getVar(ctx, name.toString().substring(1))] = value;
  } else if (name.toString().charAt(0) === '_') {
    ctx.vars[name] = value;
  } else {
    ctx.obj[name] = value;
  }
}

function getVar(ctx: Context, name: Name): any {
  if (name.toString().charAt(0) === '#') {
    return ctx.vars[getVar(ctx, name.toString().substring(1))];
  } else if (name.toString().charAt(0) === '_') {
    return ctx.vars[name];
  } else {
    return ctx.obj[name];
  }
}


export abstract class Command {
  protected id: number;

  constructor() {
    this.id = genCmdId();
  }
  /**
   * Executes this command
   * Returns the number of bytes this function needs to complete
   * or -1 to indicate that the command pointer should not advance (only useful if the newStackFrameCallback was called)

   */
  abstract exec(ctx: Context,
    chunk: Chunk,
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
      vars: ctx.vars,
      parent: ctx.parent,
      isLoading: ctx.isLoading
    };
    ctx.obj = ctx.obj[this.name];
    return 0;
  }
}

export class LeaveObjectCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an object?
    assert(ctx.parent !== undefined);
    ctx.obj = ctx.parent!.obj;
    ctx.vars = ctx.parent!.vars;
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
        ctx.obj[this.name] = []
      }
    } else {
    }

    // Descend to the child array
    ctx.parent = {
      obj: ctx.obj,
      vars: ctx.vars,
      parent: ctx.parent,
      isLoading: ctx.isLoading
    };
    ctx.obj = ctx.obj[this.name];
    return 0;
  }
}

export class LeaveArrayCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an array?
    assert(ctx.parent !== undefined);
    ctx.obj = ctx.parent!.obj;
    ctx.vars = ctx.parent!.vars;
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
        ctx.obj[index] = {}
      }
    } else {
    }

    // Descend to the child array
    ctx.parent = {
      obj: ctx.obj,
      vars: ctx.vars,
      parent: ctx.parent,
      isLoading: ctx.isLoading
    };
    ctx.obj = ctx.obj[index];
    return 0;
  }
}

export class LeaveElemCommand extends Command {
  exec(ctx: Context): number {
    // Ascend to the parent context
    // TODO check that we actually ended an element?
    assert(ctx.parent !== undefined);
    ctx.obj = ctx.parent!.obj;
    ctx.vars = ctx.parent!.vars;
    ctx.parent = ctx.parent!.parent;
    return 0;
  }
}


export class IntCommand extends Command {
  private name: Name;
  private defaultValue?: (ctx: Context) => number;
  private shouldCount: boolean;
  constructor(name: Name, defaultValue?: (ctx: Context) => number, shouldCount: boolean = true) {
    super();
    this.name = name;
    this.defaultValue = defaultValue;
    this.shouldCount = shouldCount;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(4, this.shouldCount);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      setVar(ctx, this.name, result.readInt32LE(0));
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}


export class StrCommand extends Command {
  private name: Name;
  constructor(name: Name) {
    super();
    this.name = name;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      chunk.setRollbackPoint();
      // TODO store rewind point in case something gets wrong in the middle of this

      const lengthBytes = chunk.read(4);
      if (typeof lengthBytes === 'number') {
        return lengthBytes;
      }
      let length = lengthBytes.readInt32LE(0);
      if (length === 0) {
        setVar(ctx, this.name, '');
        return 0;
      }

      //console.log('strlen', length);
      let utf16 = false;
      if (length < 0) {
        // Thanks to @Goz3rr we know that this is now an utf16 based string
        length = -2 * length;
        utf16 = true;
      }
      // TODO detect EOF
      /*if (this.cursor + length > this.stream.length) {
          console.log(this.readHex(32));
          // tslint:disable-next-line: no-console
          console.trace('buffer < ' + length);
          throw new Error('cannot read string of length: ' + length);
      }*/
      let resultStr;
      if (utf16) {
        const result = chunk.read(length - 2);
        if (typeof result === 'number') {
          // rewind
          return chunk.rollback() + result;
        }
        // .slice(this.cursor, this.cursor + length - 2);
        resultStr = decodeUTF16LE(result.toString('binary'));
      } else {
        const result = chunk.read(length - 1);
        if (typeof result === 'number') {
          // rewind
          return chunk.rollback() + result;
        }
        // .slice(this.cursor, this.cursor + length - 1);
        resultStr = result.toString('utf8');
      }
      // TODO overflow
      /*      if (this.cursor < 0) {
              throw new Error('Cursor overflowed to ' + this.cursor + ' by ' + length);
            }*/
      if (utf16) {
        const result = chunk.read(1);
        if (typeof result === 'number') {
          // rewind
          return chunk.rollback() + result;
        }
        const zero = result.readInt8(0);
        if (zero !== 0) {
          throw new Error(`string(len: ${length}) does not end with zero, but with ${zero}`);
        }
      }

      const result = chunk.read(1);
      if (typeof result === 'number') {
        // rewind
        return chunk.rollback() + result;
      }
      const zero = result.readInt8(0);
      if (zero !== 0) {
        throw new Error(`string(len: ${length}) does not end with zero, but with ${zero}`);
      }

      setVar(ctx, this.name, resultStr);
      return 0;

    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class LongCommand extends Command {
  private name: Name;
  constructor(name: Name) {
    super();
    this.name = name;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(8);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      setVar(ctx, this.name, result.toString('hex'));
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class ByteCommand extends Command {
  private name: Name;
  constructor(name: Name) {
    super();
    this.name = name;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(1);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      setVar(ctx, this.name, result.readInt8(0));
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class FloatCommand extends Command {
  private name: Name;
  constructor(name: Name) {
    super();
    this.name = name;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(4);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      setVar(ctx, this.name, result.readFloatLE(0));
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class AssertNullByteCommand extends Command {

  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(1);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      const zero = result.readInt8(0);
      if (zero !== 0) {
        throw new Error(`Byte not 0, but ${zero}`);
      }
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class HexCommand extends Command {
  private name: Name;
  private bytes: number;
  constructor(name: Name, bytes: number) {
    super();
    this.name = name;
    this.bytes = bytes;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(this.bytes);
      if (typeof result === 'number') {
        // return the amount of missing bytes
        return result;
      }
      setVar(ctx, this.name, result.toString('hex'));
      return 0;
    } else {
      // TODO writing
      throw Error('Unimplemented');
      return 0;
    }
  }
}

export class LoopCommand extends Command {
  private times: Name;
  private loopBodyCommands: Command[];
  constructor(times: Name, loopBodyCommands: Command[]) {
    super();
    this.times = times;
    this.loopBodyCommands = loopBodyCommands;
  }
  exec(ctx: Context, chunk: Chunk, newStackFrameCallback: (commands: Command[]) => void): number {
    const iterations = getVar(ctx, this.times);

    // The _index variable might be set from an enclosing loop
    if (ctx.vars._loopIndex !== this.id) {
      ctx.vars._loopIndex = this.id;
      ctx.vars._index = -1;
    }
    ctx.vars._index++;

    if (ctx.vars._index < iterations) {
      newStackFrameCallback(this.loopBodyCommands);
      // pls keep the current command pointer the same, so that we can execute the next iteration
      return -1;
    } else {
      ctx.vars._index = undefined;
      // continue after the loop
      return 0;
    }
  }
}

export class CondCommand extends Command {
  private cond: (ctx: Context) => boolean;
  private thenCommands: Command[];
  private elseCommands?: Command[];
  constructor(cond: (ctx: Context) => boolean, thenCommands: Command[], elseCommands?: Command[]) {
    super();
    this.cond = cond;
    this.thenCommands = thenCommands;
    this.elseCommands = elseCommands;
  }
  exec(ctx: Context, chunk: Chunk, newStackFrameCallback: (commands: Command[]) => void): number {
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

export class ExecCommand extends Command {
  private code: (ctx: Context) => void;
  constructor(code: (ctx: Context) => void) {
    super();
    this.code = code;
  }
  exec(ctx: Context, chunk: Chunk): number {
    this.code(ctx);
    return 0;
  }
}


export class BufferStartCommand extends Command {
  private name: Name;
  private resetBytesRead: boolean;
  constructor(name: Name, resetBytesRead: boolean) {
    super();
    this.name = name;
    this.resetBytesRead = resetBytesRead;
  }
  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {
      const result = chunk.read(4);
      if (typeof result === 'number') {
        return result;
      }
      setVar(ctx, this.name, result.readInt32LE(0));

      // TODO preload the next ${result} bytes?

    } else {
      // TODO writing
      throw Error('Unimplemented');
    }
    return 0;
  }
}

export class BufferEndCommand extends Command {

  exec(ctx: Context, chunk: Chunk): number {
    if (ctx.isLoading) {

    } else {
      // TODO writing
      throw Error('Unimplemented');
    }
    return 0;
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
  exec(ctx: Context, chunk: Chunk, newStackFrameCallback: (commands: Command[]) => void): number {
    if (ctx.isLoading) {

      const value = getVar(ctx, this.name);
      console.log(`Fetch ${value}`);

      if (this.cases[value] !== undefined) {
        newStackFrameCallback(this.cases[value]);
      } else if (this.cases['$default'] !== undefined) {
        newStackFrameCallback(this.cases['$default']);
      } else {
        console.warn(`No case found for ${value} and no default case provided`);
      }

    } else {
      // TODO writing
      throw Error('Unimplemented');
    }
    return 0;
  }
}

export class BreakCommand extends Command {

  exec(_context: Context, _chunk: Chunk, _newStackFrameCallback: (commands: Command[]) => void, dropStackFrameCallback: () => void): number {
    dropStackFrameCallback();
    return 0;
  }
}

export class DebuggerCommand extends Command {
  exec(_context: Context, _chunk: Chunk, _newStackFrameCallback: (commands: Command[]) => void, dropStackFrameCallback: () => void): number {
    debugger;
    return 0;
  }
}

// https://stackoverflow.com/a/14601808
function decodeUTF16LE(binaryStr: string): string {
  const cp = [];
  for (let i = 0; i < binaryStr.length; i += 2) {
    cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8));
  }
  return String.fromCharCode.apply(String, cp);
}