import { Builder } from '../../../engine/Builder';
import { transformProperty } from '../../Property';
import { WriteArchive } from '../../../engine/Archive';

export function transformInventoryItem(builder: Builder) {
  builder

    //.obj('value') TODO readd?
    .str('unk1', false)
    .str('itemName')
    .str('levelName')
    .str('pathName')
    .exec((ctx, ar) => {
      if (!ctx.isLoading) {
        // dirty hack to make inventory item only take up 4 bytes
        ctx.tmp._length = (ar as WriteArchive).bufferLength;
      }
    })
    .arr('properties')
    .if(ctx => !ctx.isLoading && ctx.obj.length === 0, builder => {
      builder
        .exec(ctx => ctx.tmp._name = 'None')
    })
    .str('_name')
    //.debug('_name', ctx => ctx.vars._name)

    .if(ctx => ctx.tmp._name !== 'None', builder => {
      builder
        .exec(ctx => ctx.tmp._index = 0)
        .elem('_index')
        .exec(ctx => ctx.obj.name = ctx.tmp._name)

        .call(transformProperty)
        .endElem()

    })
    .endArr()
    .exec((ctx, ar) => {
      if (!ctx.isLoading) {
        // dirty hack to make inventory item only take up 4 bytes
        (ar as WriteArchive).bufferLength = ctx.tmp._length + 4;
      }
    })
  //.endObj();
}