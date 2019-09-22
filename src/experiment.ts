class Builder {
  public obj(name: string) {
    return this;
  }
  public endObj() {
    return this;
  }

  public int(asdf: string) {
    return this;
  }
  public str(name: string) {
    return this;
  }
  public long(name: string) {
    return this;
  }
  public byte(name: string) {
    return this;
  }

  public cond(cond: ((ctx: any) => boolean),
    thenBranch: ((builder: Builder) => void),
    elseBranch?: ((builder: Builder) => void)) {
    return this;
  }

  public loop() {
    
  }
}

function transform(builder: Builder) {
  transformHeader(builder);
  builder.int('_entryCount');

}

function transformHeader(builder: Builder) {
  builder
    .obj('header')
    .int('saveHeaderType')
    .int('saveVersion')
    .int('buildVersion')
    .str('mapName')
    .str('mapOptions')
    .str('sessionName')
    .int('playDurationSeconds')
    .long('saveDateTime')
    .cond((ctx) => {
      return ctx.saveHeaderType > 4;
    }, (bldr) => {
      bldr.byte('sessionVisibility');
    })
    .endObj()
    ;
}


function transformActorOrComponent(builder: Builder) {
  builder.int('actors.length')
    .loop('actor.length', () => {

    }
    );

}