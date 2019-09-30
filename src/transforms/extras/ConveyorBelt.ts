import { Builder } from '../../engine/Builder';

export function transformConveyorBelt(builder: Builder): void {
  builder
    .obj('extra')
    .int('_itemCount', ctx => ctx.obj.items.length)
    .arr('items')
    .loop('_itemCount', builder => {
      // TODO add check for less items than the count in here
      builder
        .elem('_index')
        .assertNullByte() // TODO assertnullint
        .assertNullByte()
        .assertNullByte()
        .assertNullByte()
        .str('resourceName')
        .str('levelName')
        .str('pathName')
        .float('position')
        .endElem();
    })
    .endArr()
    .endObj();
}
