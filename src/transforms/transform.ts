import { Builder } from '../engine/Builder';
import { transformEntity } from './Entity';

function transformHeader(builder: Builder): void {
  builder
    //.obj('header')
    .int('saveHeaderType')
    .int('saveVersion')
    .int('buildVersion')
    .str('mapName')
    .str('mapOptions')
    .str('sessionName')
    .int('playDurationSeconds')
    .long('saveDateTime')
    .exec(ctx => (ctx.obj.saveDateTime = '' + ctx.obj.saveDateTime))
    .if(
      ctx => ctx.obj.saveHeaderType >= 5,
      bldr => bldr.byte('sessionVisibility')
    )
    .if(
      ctx => ctx.obj.saveVersion >= 21,
      builder => {
        builder.startCompression().bufferStart('_length', true);
      }
    );
  //.endObj();
}

function transformActor(builder: Builder): void {
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
    .endObj()
    .int('wasPlacedInLevel');
}

function transformComponent(builder: Builder): void {
  builder
    .str('className')
    .str('levelName')
    .str('pathName')
    .str('outerPathName');
}

function transformActorOrComponent(builder: Builder): void {
  builder
    .int('_type', ctx => (ctx.tmp._index < ctx.obj.actors.length ? 1 : 0))
    .if(
      ctx => ctx.tmp._type === 1,
      bldr => {
        // actor
        bldr
          .arr('actors')
          .elem('_index')
          .exec(ctx => (ctx.obj.type = ctx.tmp._type));
        transformActor(bldr);
        bldr.endElem().endArr();
      },
      bldr => {
        // component
        bldr
          .exec(
            ctx =>
              (ctx.tmp._componentIndex = ctx.tmp._index - ctx.obj.actors.length)
          )
          .arr('components')
          .elem('_componentIndex')
          .exec(ctx => (ctx.obj.type = ctx.tmp._type));

        transformComponent(bldr);
        bldr.endElem().endArr();
      }
    );
}
export function transform(builder: Builder): void {
  builder
    .call(transformHeader)
    //.exec(() => console.log('Header done'))
    .int(
      '_entryCount',
      ctx => ctx.obj.actors.length + ctx.obj.components.length
    )

    .loop('_entryCount', builder => {
      //builder.debug("AoC", ctx => ctx.tmp._index);
      builder.call(transformActorOrComponent);
    })
    //.exec(() => console.log('Actors and Components done'))
    .int('_entryCount')
    //.exec((ctx) => console.log('entryCount', ctx.vars._entryCount))
    .loop('_entryCount', builder => {
      //builder.debug("entity", ctx => ctx.tmp._index);
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
              ctx.tmp._className =
                ctx.obj.components[ctx.tmp._componentIndex].className;
            })
            .obj('components')
            .elem('_componentIndex')
            .obj('entity')
            .call(transformEntity)
            .endObj()
            .endElem()
            .endObj();
        }
      );
    })

    .arr('collected')
    .int('_collectedCount', ctx => ctx.obj.length)
    .loop('_collectedCount', builder => {
      builder
        .elem('_index')
        .str('levelName')
        .str('pathName')
        .endElem();
    })
    .endArr()
    .if(ctx => ctx.obj.saveVersion >= 21, builder => builder.bufferEnd())
    .endSaveGame();
  // TODO missing
}
