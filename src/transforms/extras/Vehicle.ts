import { Builder } from '../../engine/Builder';

export function transformVehicle(builder: Builder): void {
  builder
    .obj('extra')
    .int('_objectCount', (ctx) => ctx.obj.objects.length)
    .arr('objects')
    .loop('_objectCount', (builder) => {
      builder.elem('_index').str('name').hex('unknown', 53).endElem();
    })
    .endArr()
    .endObj();
}
