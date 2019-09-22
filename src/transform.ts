

function transform(builder: Builder) {
  transformHeader(builder);
  builder
    .int('_entryCount', ctx => ctx.actors.length + ctx.components.length)
    .loop('_entryCount', (builder, index, ctx) => transformActorOrComponent(builder, index, ctx))
    .int('_entryCount')
    .loop('_entryCount', (builder, index, ctx) => {
      if (index < ctx.actors.length) {
        const actor = ctx.actors[index];
        builder
          .obj('actors')
          .elem(index);
        transformEntity(builder, true, actor.className)
        builder
          .endElem()
          .endObj();
      } else {
        const componentIndex = index - ctx.actors.length;
        const component = ctx.components[componentIndex];
        builder
          .obj('components')
          .elem(componentIndex);
        transformEntity(builder, false, component.className);
        builder
          .endElem()
          .endObj();
      }
    });



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
    .cond(ctx => {
      return ctx.saveHeaderType > 4;
    }, bldr => {
      bldr.byte('sessionVisibility');
    })
    .endObj();
}


function transformActorOrComponent(builder: Builder, index: number, ctx: any) {
  builder
    .int('_type', ctx => index < ctx.actors.lenght ? 1 : 0)
    .cond(ctx => ctx.type === 1,
      bldr => {
        // actor
        bldr
          .obj('actors')
          .elem(index);
        transformActor(bldr);
        bldr
          .endElem()
          .endObj();
      },
      bldr => {
        // component
        bldr
          .obj('components')
          .elem(index);
        transformComponent(bldr);
        bldr
          .endElem()
          .endObj();
      });

}

function transformActor(builder: Builder) {
  builder
    .str('className')
    .str('levelName')
    .str('pathName')
    .int('needTransform')
    .obj('transform')
    .obj('rotation')
    .float(0)
    .float(1)
    .float(2)
    .float(3)
    .endObj()
    .obj('translation')
    .float(0)
    .float(1)
    .float(2)
    .endObj()
    .obj('scale3d')
    .float(0)
    .float(1)
    .float(2)
    .endObj()
    .int('wasPlacedInLevel');
}

function transformComponent(builder: Builder) {
  builder
    .str('className')
    .str('levelName')
    .str('pathName')
    .str('outerPathName');
}


function transformEntity(builder: Builder, isActor: boolean, className: string) {

}