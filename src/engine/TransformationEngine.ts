import { inspect } from "util";
import { SaveGame } from "../types";
import { ReadArchive, WriteArchive } from "./Archive";
import { Builder } from "./Builder";
import { Command, Context, LoopBodyCommand } from "./commands";

interface StackFrame {
  commands: Command[];
  currentCommand: number;
  ctx: Context;
}

export class TransformationEngine {
  private commands: Command[];
  private isLoading: boolean = false;
  private stack: StackFrame[] = [];
  /**
   * Bytes needed before next command can be fulfilled
   */
  private needBytes: number = 0;
  private buffers: Buffer[] = [];
  private bufferedBytes: number = 0;
  private bytesRead: number = 0;
  private startCompressionCallback: (buffer: Buffer) => void;
  // TODO collects Buffers and then concat them all at once

  constructor(
    rulesFunction: (builder: Builder) => void,
    startCompressionCallback: (buffer: Buffer) => void
  ) {
    this.startCompressionCallback = startCompressionCallback;
    const builder = new Builder();
    // build the rules
    rulesFunction(builder);
    this.commands = builder.getCommands();

    console.log("commands", inspect(this.commands, false, 10));
  }

  prepare(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  transformRead(buffer: Buffer) {
    this.bufferedBytes += buffer.length;
    if (this.bufferedBytes < this.needBytes) {
      console.log(`still missing ${this.needBytes - this.bufferedBytes} bytes`);
      this.buffers.push(buffer);
      // need to read more
      return;
    }

    if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    this.needBytes = 0;

    const chunk = new ReadArchive(buffer, this.bytesRead);

    if (this.stack.length === 0) {
      console.info("Starting program...");
      // Stack empty: Begin of program or something went wrong

      const saveGame = {}; // TODO put save game here when saving

      // make this global for debugging purposes
      // @ts-ignore
      global.saveGame = saveGame;

      const frame = {
        commands: this.commands,
        currentCommand: 0,
        ctx: {
          obj: saveGame,
          tmp: {},
          locals: {},
          isLoading: this.isLoading,
          path: "saveGame"
        }
      };
      this.stack.push(frame);
    }

    while (true) {
      // get current stack frame
      const frame = this.stack[this.stack.length - 1];
      if (frame.currentCommand >= frame.commands.length) {
        // move one stack frame up
        this.stack.pop();
        if (this.stack.length === 0) {
          console.warn("No more stack frames");
          //throw new Error('EOW');
          // End of program?
          break;
        }

        continue;
      }

      const cmd = frame.commands[frame.currentCommand];
      //console.log('executing', cmd);
      const needBytes = cmd.exec(
        frame.ctx,
        chunk,
        commands => {
          //        console.log(frame.ctx.vars);
          /* const vars = {
           _length: frame.ctx.vars._length,
           _index: frame.ctx.vars._index,
           _name: frame.ctx.vars._name,
           _entryCount: frame.ctx.vars._entryCount,
           _tagSize: frame.ctx.vars._tagSize,
           _type: frame.ctx.vars._type,
           _keyTransform: frame.ctx.vars._keyTransform,
           _valueTransform: frame.ctx.vars._valueTransform,
           _withNames: frame.ctx.vars._withNames,
           _className: frame.ctx.vars._className,
           _itemCount: frame.ctx.vars._itemCount,
           _childCount: frame.ctx.vars._childCount,
         };*/

          // create new stack frame
          this.stack.push({
            commands,
            currentCommand: 0,
            ctx: /*frame.ctx*/ {
              obj: frame.ctx.obj,
              tmp: frame.ctx.tmp, //Object.assign({}, frame.ctx.vars), // shallow copy the variables so that the old ones still will be there when the stack is popped
              locals: {},
              parent: frame.ctx.parent,
              isLoading: frame.ctx.isLoading,
              path: frame.ctx.path
            }
          });
        },
        () => {
          // Pop the stack to the previous loop command
          let frame = this.stack.pop();

          while (
            frame !== undefined &&
            !(frame.commands[frame.currentCommand] instanceof LoopBodyCommand)
          ) {
            frame = this.stack.pop();
          }
          if (frame === undefined) {
            throw new Error("No LoopCommand found on stack that can be broken");
          }
          // move command pointer after the loop command
          frame.currentCommand++;
          this.stack.push(frame);
        }
      );
      if (needBytes > 0) {
        // This command needs more bytes to successfully execute

        /*console.log(chunk.cursor);
        console.log('---------------------------');
        console.error(`Need ${needBytes} more bytes.`);
        console.log(frame.ctx.vars);*/
        this.needBytes = needBytes;
        // pass bytesRead to next chunk
        this.bytesRead = chunk.getBytesRead();

        // put remaining bytes into buffer for next iteration
        this.buffers = [chunk.getRemaining()];
        break;
      } else if (needBytes === -1) {
        // -1 indicates that the command pointer should not advance
      } else if (needBytes === 0 || needBytes === -3) {
        frame.currentCommand++;
      } else if (needBytes === -2) {
        // -2 indicates turning on compression
        frame.currentCommand++;
        this.buffers = [];
        this.needBytes = 0;
        this.startCompressionCallback(chunk.getRemaining());
        return;
      }

      //console.log(frame.ctx);
    }
    //console.log(saveGame);
  }

  private writeArchive?: WriteArchive;

  public getWriteArchive(): WriteArchive | undefined {
    return this.writeArchive;
  }

  // return true if writing the save file is not finished
  transformWrite(saveGame: SaveGame): boolean {
    const ar = this.writeArchive ? this.writeArchive : new WriteArchive();
    this.writeArchive = ar;

    if (this.stack.length === 0) {
      console.info("Starting program...");
      // Stack empty: Begin of program or something went wrong

      // make this global for debugging purposes
      // @ts-ignore
      global.saveGame = saveGame;

      const frame = {
        commands: this.commands,
        currentCommand: 0,
        ctx: {
          obj: saveGame,
          tmp: {},
          locals: {},
          isLoading: this.isLoading,
          path: "saveGame"
        }
      };
      this.stack.push(frame);
    }

    while (true) {
      // get current stack frame
      const frame = this.stack[this.stack.length - 1];
      if (frame.currentCommand >= frame.commands.length) {
        // move one stack frame up
        this.stack.pop();
        if (this.stack.length === 0) {
          console.warn("No more stack frames");
          //throw new Error('EOW');
          // End of program?
          break;
        }

        continue;
      }

      const cmd = frame.commands[frame.currentCommand];
      //console.log('executing', cmd);
      const needBytes = cmd.exec(
        frame.ctx,
        ar,
        commands => {
          //        console.log(frame.ctx.vars);
          /* const vars = {
           _length: frame.ctx.vars._length,
           _index: frame.ctx.vars._index,
           _name: frame.ctx.vars._name,
           _entryCount: frame.ctx.vars._entryCount,
           _tagSize: frame.ctx.vars._tagSize,
           _type: frame.ctx.vars._type,
           _keyTransform: frame.ctx.vars._keyTransform,
           _valueTransform: frame.ctx.vars._valueTransform,
           _withNames: frame.ctx.vars._withNames,
           _className: frame.ctx.vars._className,
           _itemCount: frame.ctx.vars._itemCount,
           _childCount: frame.ctx.vars._childCount,
         };*/

          // create new stack frame
          this.stack.push({
            commands,
            currentCommand: 0,
            ctx: /*frame.ctx*/ {
              obj: frame.ctx.obj,
              tmp: frame.ctx.tmp, //Object.assign({}, frame.ctx.vars), // shallow copy the variables so that the old ones still will be there when the stack is popped
              locals: {},
              parent: frame.ctx.parent,
              isLoading: frame.ctx.isLoading,
              path: frame.ctx.path
            }
          });
        },
        () => {
          // Pop the stack to the previous loop command
          let frame = this.stack.pop();

          while (
            frame !== undefined &&
            !(frame.commands[frame.currentCommand] instanceof LoopBodyCommand)
          ) {
            frame = this.stack.pop();
          }
          if (frame === undefined) {
            throw new Error("No LoopCommand found on stack that can be broken");
          }
          // move command pointer after the loop command
          frame.currentCommand++;
          this.stack.push(frame);
        }
      );
      if (needBytes > 0) {
        // This command has filled a chunk
        // TODO write out chunk

        return true;
      } else if (needBytes === -1) {
        // -1 indicates that the command pointer should not advance
      } else if (needBytes === 0) {
        frame.currentCommand++;
      } else if (needBytes === -2) {
        // -2 indicates turning on compression
        frame.currentCommand++;
        this.startCompressionCallback(this.writeArchive.getHeaderChunk());
        this.writeArchive.writeInt(0, true);
        return true;
      } else if (needBytes === -3) {
        // end of the save game
        return false;
      }

      //console.log(frame.ctx);
    }
    //console.log(saveGame);
    return true;
  }

  end(callback: (error?: Error | null | undefined) => void) {
    if (this.needBytes !== 0) {
      callback(new Error(`Missing ${this.needBytes} bytes`));
    } else {
      // TODO check for spare bytes
      callback();
    }
  }
}
