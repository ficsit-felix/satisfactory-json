import { Builder } from '../../../engine/Builder';
import { transformProperty } from '../../Property';

export function transformInventoryItem(builder: Builder) {
  builder
    .obj('value')
    .str('unk1', false)
    .str('itemName')
    .str('levelName')
    .str('pathName')

    .obj('properties')
    .str('_name')
    //.debug('_name', ctx => ctx.vars._name)
    .if(ctx => ctx.vars._name !== 'None', builder => {
      builder
        .exec(ctx => ctx.obj.name = ctx.vars._name)
        .call(transformProperty)
    })
    .endObj()
    .endObj();
}