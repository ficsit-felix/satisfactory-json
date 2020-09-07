import { Builder } from '../../engine/Builder';
import { transformStructProperty } from './StructProperty';
import { debug } from 'console';
import { RegisteredFunction } from '../../engine/TransformationEngine';

// This has so far only occurred with the sweetTransportal mod
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
              .int('unk1')
              .str('name')
              .str('type')
              .int('unk2')
              .int('unk3')
              .call(RegisteredFunction.transformStructProperty)
              .endElem();
          })
          .endArr();
      },
      $default: (builder) => {
        builder.error((ctx) => `Unknown set type: ${ctx.obj.type}`);
      },
    })
    .endObj();
}
