import { Builder } from '../../engine/Builder';

// This has so far only occurred with the sweetTransportal mod
export function transformSetProperty(builder: Builder): void {
  builder
    .obj('value')
    .str('type', false) // Tag.InnerType
    .assertNullByte(false) // Tag.HasPropertyGuid
    .int('_zero', () => 0)
    .int('_itemCount', ctx => ctx.obj.values.length)

    .switch('type', {
      NameProperty: builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder.str('#_index');
          })
          .endArr();
      },
      $default: builder => {
        builder.error(ctx => `Unknown set type: ${ctx.obj.type}`);
      }
    })
    .endObj();
}
