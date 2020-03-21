import { Builder } from '../../engine/Builder';
import { ReadArchive } from '../../engine/Archive';

export function transformConveyorBelt(builder: Builder): void {
  builder
    .obj('extra')
    .int('_itemCount', (ctx) => ctx.obj.items.length)
    .arr('items')
    .loop('_itemCount', (builder) => {
      // TODO add check for less items than the count in here
      builder
        .exec((ctx, ar, dropStackFrameCallback) => {
          if (ctx.isLoading) {
            if ((ar as ReadArchive).getBytesRead() >= ctx.tmp._entityLength) {
              //console.warn('Item count is ' + items.length +
              //' while there are only ' + i + ' items in there');

              // break:
              dropStackFrameCallback();
            }
          }
        })

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
