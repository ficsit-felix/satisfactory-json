/**
 * Name used to access a property or an array element
 */
export type Name = string | number;

export interface Context {
  obj: { [id: string]: any };
  vars: { [id: string]: any };
}

export interface Command {
  /**
   * Executes this command
   * Returns false if it needs more data to complete
   * TODO return number of missing bytes?
   * 
   * @param isLoading 
   * @param ctx 
   */
  exec(isLoading: boolean, ctx: Context): boolean;
}

export class EnterObjectCommand implements Command {

  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  exec(isLoading: boolean, ctx: Context): boolean {
    throw new Error('Method not implemented.');
  }
}

export class LeaveObjectCommand implements Command {
  exec(isLoading: boolean, ctx: Context): boolean {
    throw new Error('Method not implemented.');
  }
}

export class IntCommand implements Command {
  private name: Name;
  private defaultValue?: (ctx: Context) => number;
  constructor(name: Name, defaultValue?: (ctx: Context) => number) {
    this.name = name;
    this.defaultValue = defaultValue;
  }
  exec(isLoading: boolean, ctx: Context): boolean {
    throw new Error('Method not implemented.');
  }
}

export class LoopCommand implements Command {
  private times: Name;
  private loopBodyCommands: Command[];
  constructor(times: Name, loopBodyCommands: Command[]) {
    this.times = times;
    this.loopBodyCommands = loopBodyCommands;
  }
  exec(isLoading: boolean, ctx: Context): boolean {
    throw new Error('Method not implemented.');
  }
}