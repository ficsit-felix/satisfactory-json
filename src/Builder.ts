/**
 * Name used to access a property or an array element
 */
type Name = string | number;

class Builder {
  /**
   * Descend down into an object
   * @param name name of the variable
   */
  public obj(name: string): Builder {
    return this;
  }
  /**
   * Ascend back up to the parent object
   */
  public endObj(): Builder {
    return this;
  }

  /**
   * Ascend down into an array
   * @param index index in the array
   */
  public elem(index: number): Builder {
    return this;
  }

  /**
   * Ascend back up to the parent of the array
   */
  public endElem(): Builder {
    return this;
  }

  public int(name: Name, defaultValue?: (ctx: any) => number): Builder {
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

  /**
   * Execute arbitrary javascript code when the TransformEngine gets to this point
   * @param code 
   */
  public exec(code: (builder: Builder) => void) {
    return this;
  }

  /**
   * Do two different things depending on the condition
   * @param cond 
   * @param thenBranch 
   * @param elseBranch 
   */
  public cond(cond: (ctx: any) => boolean,
    thenBranch: (builder: Builder) => void,
    elseBranch?: (builder: Builder) => void): Builder {
    return this;
  }

  public loop(times: string, loopBody: (builder: Builder, index: number, ctx: any) => void): Builder {
    return this;
  }
}