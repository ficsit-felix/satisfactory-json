import { Builder } from './Builder';
import { Command, Context } from './commands';
import { inspect } from 'util';
import { TransformCallback } from 'stream';
import { Chunk } from './Chunk';

interface StackFrame {
  commands: Command[];
  currentCommand: number;
  ctx: Context;
};

export class TransformationEngine {

  private commands: Command[];
  private isLoading: boolean = false;
  private stack: StackFrame[] = [];

  // TODO collects Buffers and then concat them all at once


  constructor(rulesFunction: (builder: Builder) => void) {
    const builder = new Builder();
    // build the rules
    rulesFunction(builder);
    this.commands = builder.getCommands();

    console.log('commands', inspect(this.commands, false, 10));
  }

  prepare(isLoading: boolean) {
    this.isLoading = isLoading;
  }

  transform(buffer: Buffer, callback: TransformCallback) {
    const chunk = new Chunk(buffer);
    const saveGame = {};// TODO put save game here when saving

    if (this.stack.length === 0) {
      console.info('Starting program...');
      // Stack empty: Begin of program or something went wrong
      const frame = {
        commands: this.commands,
        currentCommand: 0,
        ctx: {
          obj: saveGame,
          vars: {}
        }
      };
      this.stack.push(frame);
    }

    while (true) {
      // get current stack frame
      const frame = this.stack[this.stack.length - 1];
      const cmd = frame.commands[frame.currentCommand];
      console.log('executing', cmd);
      const needBytes = cmd.exec(this.isLoading, frame.ctx, chunk, commands => {
        // create new stack frame
        this.stack.push({
          commands,
          currentCommand: 0,
          ctx: frame.ctx
        });
      });
      if (needBytes > 0) { // This command needs more bytes to successfully execute

        break;
      }
      frame.currentCommand++;
      if (frame.currentCommand >= frame.commands.length) {
        // TODO move one stack frame up
        break;
      }

      console.log(frame.ctx);
    }


    console.log(saveGame);
  }

}