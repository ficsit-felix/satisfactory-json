import { Builder } from '../../../engine/Builder';
import { transformProperty } from '../../Property';
import { exec } from 'child_process';

export function transformInventoryItem(builder: Builder) {
  builder
    //.obj('value') TODO readd?
    .str('unk1', false)
    .str('itemName')
    .str('levelName')
    .str('pathName')

    .arr('properties')
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
  //.endObj();
}