import { Builder } from '../engine/Builder';
import { transformEntity } from './Entity';


export function transform(builder: Builder) {
  builder
    .call(transformHeader)
    //.exec(() => console.log('Header done'))
    .int('_entryCount', ctx => ctx.obj.actors.length + ctx.obj.components.length)
    .loop('_entryCount', builder => builder.call(transformActorOrComponent))
    //.exec(() => console.log('Actors and Components done'))
    .int('_entryCount')
    //.exec((ctx) => console.log('entryCount', ctx.vars._entryCount))
    .loop('_entryCount', builder => {
      builder.if(
        ctx => ctx.tmp._index < ctx.obj.actors.length,
        builder => {
          builder
            .exec(ctx => {
              ctx.tmp._withNames = true;
              ctx.tmp._className = ctx.obj.actors[ctx.tmp._index].className;
            })
            .obj('actors')
            .elem('_index')
            .obj('entity')
            .call(transformEntity)
            .endObj()
            .endElem()
            .endObj();
        },
        builder => {
          builder
            .exec(ctx => {
              ctx.tmp._withNames = false;
              ctx.tmp._componentIndex = ctx.tmp._index - ctx.obj.actors.length;
              ctx.tmp._className = ctx.obj.components[ctx.tmp._componentIndex].className;
            })
            .obj('components')
            .elem('_componentIndex')
            .obj('entity')
            .call(transformEntity)
            .endObj()
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
    .if(ctx => {
      return ctx.obj.saveHeaderType > 4;
    }, bldr => {
      bldr.byte('sessionVisibility');
    })
    .endObj();
}


function transformActorOrComponent(builder: Builder) {
  builder
    .int('_type', ctx => ctx.tmp._index < ctx.obj.actors.length ? 1 : 0)
    .if(ctx => ctx.tmp._type === 1,
      bldr => {
        // actor
        bldr
          .arr('actors')
          .elem('_index');
        transformActor(bldr);
        bldr
          .endElem()
          .endArr();
      },
      bldr => {
        // component
        bldr
          .exec(ctx => ctx.tmp._componentIndex = ctx.tmp._index - ctx.obj.actors.length)
          .arr('components')
          .elem('_componentIndex');
        transformComponent(bldr);
        bldr
          .endElem()
          .endArr();
      });

}

function transformActor(builder: Builder) {
  builder
    .str('className')
    .str('levelName')
    .str('pathName')
    .int('needTransform')
    .obj('transform')
    .arr('rotation')
    .float(0)
    .float(1)
    .float(2)
    .float(3)
    .endArr()
    .arr('translation')
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .arr('scale3d')
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .int('wasPlacedInLevel')
    .endObj();
}

function transformComponent(builder: Builder) {
  builder
    .str('className')
    .str('levelName')
    .str('pathName')
    .str('outerPathName');
}

