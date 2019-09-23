import { Builder } from '../../engine/Builder';

export function transformGameMode(builder: Builder) {
  builder
    .obj('extra')
    .int('_objectCount', ctx => ctx.obj.objects.length)
    .arr('objects')
    .loop('_objectCount', builder => {
      builder.elem('_index')
        .str('levelName')
        .str('pathName')
        .endElem()
    })
    .endArr()
    .endObj();
}