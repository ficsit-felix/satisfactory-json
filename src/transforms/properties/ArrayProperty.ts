import { Builder } from '../../engine/Builder';

export function transformArrayProperty(builder: Builder) {
  builder
    .obj('value')
    .str('type') // Tag.InnerType
    .assertNullByte() // Tag.HasPropertyGuid
    .int('_itemCount', ctx => ctx.obj.values.length)
    .switch('type', {
      'IntProperty': builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder.int('#_index');
          })
          .endArr();
      },
      'ByteProperty': builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder.byte('#_index');
          })
          .endArr();
      },
      'EnumProperty': builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder.str('#_index');
          })
          .endArr();
      },
      'ObjectProperty': builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder
              .elem('_index')
              .str('levelName')
              .str('pathName')
              .endElem();
          })
          .endArr();
      },

      '$default': builder => {
        builder.error(ctx => `Unknown array type: ${ctx.obj.type}`);
      }
    })
    .endObj();
}