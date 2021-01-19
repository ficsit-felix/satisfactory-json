import { Builder } from '../engine/Builder';
import { RegisteredFunction } from '../engine/TransformationEngine';

export function transformHeader(builder: Builder): void {
  builder
    //.obj('header')
    .int('saveHeaderType')
    .int('saveVersion')
    .int('buildVersion')
    // Store buildVersion in tmp object to be able to access it later in TextProperty
    .exec((ctx) => (ctx.tmp.buildVersion = ctx.obj.buildVersion))
    .str('mapName')
    .str('mapOptions')
    .str('sessionName')
    .int('playDurationSeconds')
    .long('saveDateTime')
    .exec((ctx) => (ctx.obj.saveDateTime = '' + ctx.obj.saveDateTime))
    .if(
      (ctx) => ctx.obj.saveHeaderType >= 5,
      (bldr) => bldr.byte('sessionVisibility')
    )
    .if(
      (ctx) => ctx.obj.saveVersion >= 21,
      (builder) => {
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

export function transformActorOrComponent(builder: Builder): void {
  builder
    .int('_type', (ctx) => (ctx.tmp._index < ctx.obj.actors.length ? 1 : 0))
    .if(
      (ctx) => ctx.tmp._type === 1,
      (bldr) => {
        // actor
        bldr
          .arr('actors')
          .elem('_actorIndex')
          .exec((ctx) => {
            ctx.obj.type = ctx.tmp._type;
            ctx.tmp._objectTypes[ctx.tmp._index] = 1;
            ctx.tmp._actorIndex++;
          });
        transformActor(bldr);
        bldr.endElem().endArr();
      },
      (bldr) => {
        // component
        bldr
          .arr('components')
          .elem('_componentIndex')
          .exec((ctx) => {
            ctx.obj.type = ctx.tmp._type;
            ctx.tmp._componentIndex++;
            ctx.tmp._objectTypes[ctx.tmp._index] = 0;
          });

        transformComponent(bldr);
        bldr.endElem().endArr();
      }
    );
}
export function transform(builder: Builder): void {
  builder
    .call(RegisteredFunction.transformHeader)
    .int(
      '_entryCount',
      (ctx) => ctx.obj.actors.length + ctx.obj.components.length
    )
    .exec((ctx) => {
      // In very rare cases, actors can follow the components. Therefore we need to count the indices seperately and cannot rely on _componentIndex = _index - ctx.actors.length
      ctx.tmp._actorIndex = 0;
      ctx.tmp._componentIndex = 0;
      // To correctly assign the entities, we still need to store whether it was an entity or a component
      ctx.tmp._objectTypes = [];
    })
    .loop('_entryCount', (builder) => {
      builder
        .emitEntityProgress(50, 0)
        .call(RegisteredFunction.transformActorOrComponent);
    })
    .int('_entryCount')
    .exec((ctx) => {
      ctx.tmp._actorIndex = 0;
      ctx.tmp._componentIndex = 0;
    })
    .loop('_entryCount', (builder) => {
      builder.emitEntityProgress(50, 50).if(
        (ctx) => ctx.tmp._objectTypes[ctx.tmp._index] === 1, //ctx.tmp._index < ctx.obj.actors.length,
        (builder) => {
          builder
            .exec((ctx) => {
              ctx.tmp._withNames = true;
              ctx.tmp._className =
                ctx.obj.actors[ctx.tmp._actorIndex].className;
            })
            .obj('actors')
            .elem('_actorIndex')
            .obj('entity')
            .call(RegisteredFunction.transformEntity)
            .endObj()
            .endElem()
            .endObj()
            .exec((ctx) => ctx.tmp._actorIndex++);
        },
        (builder) => {
          builder
            .exec((ctx) => {
              ctx.tmp._withNames = false;
              ctx.tmp._className =
                ctx.obj.components[ctx.tmp._componentIndex].className;
            })
            .obj('components')
            .elem('_componentIndex')
            .obj('entity')
            .call(RegisteredFunction.transformEntity)
            .endObj()
            .endElem()
            .endObj()
            .exec((ctx) => ctx.tmp._componentIndex++);
        }
      );
    })

    .arr('collected')
    .int('_collectedCount', (ctx) => ctx.obj.length)
    .loop('_collectedCount', (builder) => {
      builder.elem('_index').str('levelName').str('pathName').endElem();
    })
    .endArr()
    .if(
      (ctx) => ctx.obj.saveVersion >= 21,
      (builder) => builder.bufferEnd()
    )
    .endSaveGame();
  // TODO missing
}
