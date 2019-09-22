import { TransformationEngine } from './TransformationEngine';
import { Name, Command, EnterObjectCommand, LeaveObjectCommand, IntCommand, LoopCommand, Context } from './commands';



export class Builder {
  private commands: Command[] = [];



  public getCommands(): Command[] {
    return this.commands;
  }

  /**
   * Descend down into an object
   * @param name name of the variable
   */
  public obj(name: string): Builder {
    this.commands.push(new EnterObjectCommand(name));
    return this;
  }
  /**
   * Ascend back up to the parent object
   */
  public endObj(): Builder {
    this.commands.push(new LeaveObjectCommand());
    return this;
  }

  /**
   * Ascend down into an array
   * @param index index in the array
   */
  public elem(index: Name): Builder {
    return this;
  }

  /**
   * Ascend back up to the parent of the array
   */
  public endElem(): Builder {
    return this;
  }

  public int(name: Name, defaultValue?: (ctx: Context) => number): Builder {
    this.commands.push(new IntCommand(name, defaultValue));
    return this;
  }
  public str(name: Name): Builder {
    return this;
  }
  public long(name: Name): Builder {
    return this;
  }
  public byte(name: Name): Builder {
    return this;
  }
  public float(name: Name): Builder {
    return this;
  }


  public call(rulesFunction: (builder: Builder) => void) {
    // TODO don't do this multiple times?
    rulesFunction(this);
    return this;
  }
  /**
   * Execute arbitrary javascript code when the TransformEngine gets to this point
   * @param code 
   */
  public exec(code: (ctx: Context, builder: Builder) => void) {
    return this;
  }

  /**
   * Do two different things depending on the condition
   * @param cond 
   * @param thenBranch 
   * @param elseBranch 
   */
  public cond(cond: (ctx: Context) => boolean,
    thenBranch: (builder: Builder) => void,
    elseBranch?: (builder: Builder) => void): Builder {
    return this;
  }

  /**
   * Does the same thing a couple of times.
   * Inside the loopBody, _index will be set to the current index
   * @param times 
   * @param loopBody 
   */
  public loop(times: Name, loopBody: (builder: Builder) => void): Builder {
    const loopBodyBuilder = new Builder();
    loopBody(loopBodyBuilder);
    this.commands.push(new LoopCommand(times, loopBodyBuilder.getCommands()));
    return this;
  }
}