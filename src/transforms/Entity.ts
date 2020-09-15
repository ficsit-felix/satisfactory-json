import { Builder } from '../engine/Builder';
import { RegisteredFunction } from '../engine/TransformationEngine';

export function transformProperties(builder: Builder): void {
  // TODO fix loop for writing
  builder
    .arr('properties')
    .exec(
      (ctx) =>
        (ctx.tmp._propertiesCount = ctx.isLoading ? 999999999 : ctx.obj.length)
    )
    .loop('_propertiesCount', (builder) => {
      builder
        // special case for berry bush InventoryStack, but when writing we need to break here already, so we don't write the None
        .if(
          (ctx) =>
            !ctx.isLoading &&
            ctx.obj[ctx.tmp._index].value.type === 'InventoryItem' &&
            ctx.obj[ctx.tmp._index].value.properties != undefined &&
            ctx.obj[ctx.tmp._index].value.properties.length === 0,
          (builder) => {
            builder.break();
          }
        )

        .exec((ctx) => {
          if (!ctx.isLoading) {
            ctx.tmp._name = ctx.obj[ctx.tmp._index].name;
          }
        })
        .str('_name')
        //.debug('_name', ctx => ctx.vars._name)
        .if(
          (ctx) => ctx.tmp._name === 'None',
          (builder) => builder.break()
        )
        .elem('_index')
        .exec((ctx) => (ctx.obj.name = ctx.tmp._name))
        .call(RegisteredFunction.transformProperty)

        // special case for InventoryStack in berry items where there is only one 'None' after the InventoryItem which is supposed to close both the property list of the InventoryItem and the InventoryStack on experimental version 120219 for some reason?
        .if(
          (ctx) =>
            ctx.obj.value.type === 'InventoryItem' &&
            ctx.obj.value.properties != undefined &&
            ctx.obj.value.properties.length === 0,
          (builder) => {
            builder.endElem();
            builder.break();
          }
        )

        .endElem();
    })
    .if(
      (ctx) => !ctx.isLoading,
      (builder) => {
        builder.exec((ctx) => (ctx.tmp._none = 'None')).str('_none');
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
      (ctx) => ctx.tmp._withNames,
      (builder) => {
        builder
          .str('levelName')
          .str('pathName')
          .int('_childCount', (ctx) => ctx.obj.children.length)
          .arr('children')
          .loop('_childCount', (builder) => {
            builder.elem('_index').str('levelName').str('pathName').endElem();
          })
          .endArr();
      }
    )

    .call(RegisteredFunction.transformProperties)
    .int('_extraObjectCount', () => 0)
    .exec((ctx) => {
      if (ctx.tmp._extraObjectCount !== 0) {
        console.error(
          `Extra object count not zero, but ${ctx.tmp._extraObjectCount}`,
          ctx
        );
      }
    })
    .call(RegisteredFunction.transformExtra);

  builder
    // TODO read missing data
    .hexRemaining('missing', '_entityLength')
    .exec((ctx) => {
      if (ctx.obj.missing !== '') {
        console.warn('Too much data in object: ', ctx.obj.missing, ctx);
      }
    })

    .bufferEnd();
}
