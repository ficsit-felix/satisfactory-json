import { Builder } from './Builder';
import { Command } from './commands';
import { inspect } from 'util';

export class TransformationEngine {

  private commands: Command[];

  // TODO collects Buffers and then concat them all at once


  constructor(rulesFunction: (builder: Builder) => void) {
    const builder = new Builder();
    // build the rules
    rulesFunction(builder);
    this.commands = builder.getCommands();

    console.log('commands', inspect(this.commands, false, 10));
  }
}