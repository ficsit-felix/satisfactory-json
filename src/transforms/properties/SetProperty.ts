import { Builder } from '../../engine/Builder';
import { RegisteredFunction } from '../../engine/TransformationEngine';

// This has so far only been seen in mods such as sweetTransportal and FicsIt-Network
export function transformSetProperty(builder: Builder): void {
  builder
    .obj('value')
    .str('type', false) // Tag.InnerType
    .assertNullByte(false) // Tag.HasPropertyGuid
    .int('_zero', () => 0)
    .int('_itemCount', (ctx) => ctx.obj.values.length)

    .switch('type', {
      NameProperty: (builder) => {
        builder
          .arr('values')
          .loop('_itemCount', (builder) => {
            builder.str('#_index');
          })
          .endArr();
      },
      ObjectProperty: (builder) => {
        builder
          .arr('values')
          .loop('_itemCount', (builder) => {
            builder.elem('_index').str('levelName').str('pathName').endElem();
          })
          .endArr();
      },
      StructProperty: (builder) => {
        builder
          .arr('values')
          .loop('_itemCount', (builder) => {
            builder
              .elem('_index')
              // This currently used to store FFINNetworkTrace by the FicsIt-Networks mod which uses custom serialization logic
              .call(RegisteredFunction.transformFINNetworkTrace)
              .endElem();
          })
          .endArr();
      },
      IntProperty: (builder) => {
        builder
          .arr('values')
          .loop('_itemCount', (builder) => {
            builder.int('#_index');
          })
          .endArr();
      },
      $default: (builder) => {
        builder.error((ctx) => `Unknown set type: ${ctx.obj.type}`);
      },
    })
    .endObj();
}
