import { Builder } from '../../engine/Builder';
import { transformProperty } from '../Property';

export function transformArrayProperty(builder: Builder) {
  builder
    .obj('value')
    .str('type') // Tag.InnerType
    .assertNullByte(false) // Tag.HasPropertyGuid
    .int('_itemCount', ctx => ctx.obj.values.length)
    .switch('type', {
      'IntProperty': builder => {
        builder
          .arr('values')
          .loop('_itemCount', builder => {
            builder
              .int('#_index');
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
      'StructProperty': builder => {
        builder
          .str('structName')
          .str('structType')
          .bufferStart('_length', false)
          .int('_zero', ctx => 0, false)
          .exec(ctx => { if (ctx.tmp._zero !== 0) { throw new Error(`Not zero, but ${ctx.tmp._zero}`) } })
          .str('structInnerType')
          .hex('propertyGuid', 16, false)
          .assertNullByte(false)
          .arr('values')
          .loop('_itemCount', builder => {
            builder



              .if(ctx => ctx.parent!.parent!.obj.structInnerProperty === 'Guid',
                builder => {
                  builder.hex('#_index', 16);
                },
                builder => {
                  builder.elem('_index')


                    // parse inner properties
                    // TODO fix loop for writing
                    .arr('properties')
                    .exec(ctx => ctx.tmp._propertiesCount = ctx.isLoading ? 999999999 : ctx.obj.length)
                    .loop('_propertiesCount', builder => {
                      builder.str('_name')
                        //.debug('_name', ctx => ctx.vars._name)
                        .if(ctx => ctx.tmp._name === 'None', builder => builder.break())
                        //.exec(ctx => console.log('properties._index', ctx.vars._index))
                        .elem('_index')
                        .exec(ctx => ctx.obj.name = ctx.tmp._name)
                        .call(transformProperty)
                        .endElem()
                    })
                    .endArr()
                    .endElem();
                })




          })
          .endArr();

      },
      '$default': builder => {
        builder.error(ctx => `Unknown array type: ${ctx.obj.type}`);
      }
    })
    .endObj();
}