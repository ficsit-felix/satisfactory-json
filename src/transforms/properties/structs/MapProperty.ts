import { Builder } from '../../../engine/Builder';
import { transformProperties } from '../../Entity';
import { transformBoolProperty } from '../BoolProperty';

export function transformMapProperty(builder: Builder) {
  builder
    .obj('value')
    .str('keyType', false) // Tag.InnerType
    .str('valueType', false) // Tag.ValueType
    .assertNullByte() // Tag.HasPropertyGuid
    .int('_zero', () => 0)
    .exec(ctx => { if (ctx.tmp._zero !== 0) { throw Error(`Not 0, but ${ctx.tmp._zero}`) } })
    .int('_count', ctx => ctx.obj.values.length)
    .exec(ctx => {
      // decide key and value functions
      ctx.tmp._keyTransform = ctx.obj.keyType;
      ctx.tmp._valueTransform = ctx.obj.valueType;

      /*
        The following two maps both have the property.value.valueType ByteProperty.
        But in the first case the values are stored as bytes and in the second case they are
        stored as strings.

        UPROPERTY(VisibleAnywhere, SaveGame)
        TMap<FName, uint8> TestByteMap;

        UPROPERTY(VisibleAnywhere, SaveGame)
        TMap<FName, TEnumAsByte< EEnabled >> TestEnumAsByteMap;
      */
      if (ctx.obj.valueType === 'ByteProperty') {
        if (ctx.isLoading) {
          // Currently the enum version is only used by LightItUp mod
          // this is the only one that also uses a StrProperty as the key (yet)
          if (ctx.obj.keyType === 'StrProperty') {
            ctx.tmp._valueTransform = 'EnumByteProperty';
          }
        } else {
          if (ctx.obj.values.length > 0 && typeof ctx.obj.values[0].value === 'string') {
            ctx.tmp._valueTransform = 'EnumByteProperty';
          }
        }
      }
    })

    .arr('values')
    .loop('_count', builder => {
      builder
        .elem('_index')
        .switch('_keyTransform', {
          'IntProperty': builder => {
            builder.int('key');
          },
          'ObjectProperty': builder => {
            builder
              .obj('key')
              .str('levelName')
              .str('pathName')
              .endObj();
          },
          'StrProperty': builder => {
            builder.str('key');
          },
          '$default': builder => {
            builder.exec(ctx => { throw Error(`Unimplemented key type ${ctx.tmp._keyTransform}`); });
          }
        })
        .switch('_valueTransform', {
          'StructProperty': builder => {
            builder.call(transformProperties);
          },
          'ByteProperty': builder => {
            builder.byte('value');
          },
          'EnumByteProperty': builder => {
            builder.str('value');
          },
          '$default': builder => {
            builder.exec(ctx => { throw Error(`Unimplemented value type ${ctx.tmp._valueTransform}`); });
          }
        })
        .endElem()
    })
    .endArr()


    .endObj()
}