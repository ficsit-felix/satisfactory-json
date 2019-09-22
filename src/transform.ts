import { Builder } from './Builder';


export function transform(builder: Builder) {
  builder
    .call(transformHeader)
    .int('_entryCount', ctx => ctx.obj.actors.length + ctx.obj.components.length)
    .loop('_entryCount', builder => builder.call(transformActorOrComponent))
    .int('_entryCount')
    .loop('_entryCount', builder => {
      builder.cond(
        ctx => ctx.vars._index < ctx.obj.actors.length,
        builder => {
          builder
            .exec(ctx => {
              ctx.vars._actor = ctx.obj.actors[ctx.vars._index];
            })
            .obj('actors')
            .elem('_index')
            .call(transformEntity)
            .endElem()
            .endObj();
        },
        builder => {
          builder
            .exec(ctx => ctx.vars._componentIndex = ctx.vars._index - ctx.obj.actors.lenght)
            .obj('components')
            .elem('_componentIndex')
            .call(transformEntity)
            .endElem()
            .endObj();
        });
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
      return ctx.obj.saveHeaderType > 4;
    }, bldr => {
      bldr.byte('sessionVisibility');
    })
    .endObj();
}


function transformActorOrComponent(builder: Builder) {
  builder
    .int('_type', ctx => ctx.vars._index < ctx.obj.actors.lenght ? 1 : 0)
    .cond(ctx => ctx.obj.type === 1,
      bldr => {
        // actor
        bldr
          .obj('actors')
          .elem('_index');
        transformActor(bldr);
        bldr
          .endElem()
          .endObj();
      },
      bldr => {
        // component
        bldr
          .obj('components')
          .elem('_index');
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


function transformEntity(builder: Builder) {

}