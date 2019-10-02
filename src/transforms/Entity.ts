import { Builder } from '../engine/Builder';
import { RegisteredFunction } from '../engine/TransformationEngine';

export function transformProperties(builder: Builder): void {
  // TODO fix loop for writing
  builder
    .arr('properties')
    .exec(
      ctx =>
        (ctx.tmp._propertiesCount = ctx.isLoading ? 999999999 : ctx.obj.length)
    )
    .loop('_propertiesCount', builder => {
      builder
        .exec(ctx => {
          if (!ctx.isLoading) {
            ctx.tmp._name = ctx.obj[ctx.tmp._index].name;
          }
        })
        .str('_name')
        //.debug('_name', ctx => ctx.vars._name)
        .if(ctx => ctx.tmp._name === 'None', builder => builder.break())
        //.exec(ctx => console.log('properties._index', ctx.vars._index))
        .elem('_index')
        .exec(ctx => (ctx.obj.name = ctx.tmp._name))
        .call(RegisteredFunction.transformProperty)
        .endElem();
    })
    .if(
      ctx => !ctx.isLoading,
      builder => {
        builder.exec(ctx => (ctx.tmp._none = 'None')).str('_none');
      }
    )
    .endArr();
}

// TODO _withNames
export function transformEntity(builder: Builder): void {
  builder
    .bufferStart('_entityLength', true)
    //.debug('_entityLength', ctx => ctx.tmp._entityLength)
    //.debug('_length', ctx => ctx.vars._length)

    .if(
      ctx => ctx.tmp._withNames,
      builder => {
        builder
          .str('levelName')
          .str('pathName')
          .int('_childCount', ctx => ctx.obj.children.length)
          .arr('children')
          .loop('_childCount', builder => {
            builder
              .elem('_index')
              .str('levelName')
              .str('pathName')
              .endElem();
          })
          .endArr();
      }
    )

    .call(RegisteredFunction.transformProperties)
    /*.exec(ctx => {
      if (ctx.path.startsWith('saveGame.actors[473]')) {
        debugger;
      }
    })*/
    //.exec(ctx => console.log('entity', ctx.obj))
    .int('_extraObjectCount', () => 0)
    .exec(ctx => {
      if (ctx.tmp._extraObjectCount !== 0) {
        throw Error(
          `Extra object count not zero, but ${ctx.tmp._extraObjectCount}`
        );
      }
    })
    .call(RegisteredFunction.transformExtra);

  builder
    // TODO read missing data
    //.debug('>_entityLength', ctx => ctx.tmp._entityLength)
    .hexRemaining('missing', '_entityLength')
    .exec(ctx => {
      if (ctx.obj.missing !== '') {
        console.error('missing', ctx.obj.missing, ctx);
      }
    })

    .bufferEnd();
}
