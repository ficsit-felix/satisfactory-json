import { Builder } from '../engine/Builder';
import { transformArrayProperty } from './properties/ArrayProperty';

export function transformProperty(builder: Builder) {
  builder
    .exec(ctx => { ctx.obj.name = ctx.vars._name; console.log('propertyName', ctx.obj.name) })
    .str('type') // Tag.Type
    .bufferStart('_tagSize', false) // Tag.Size
    .int('index', undefined, false) // Tag.ArrayIndex
    .switch('type', {
      /*'IntProperty': builder => builder.call(transformIntProperty),
      'BoolProperty': builder => builder.call(transformBoolProperty),
      'FloatProperty': builder => builder.call(transformFloatProperty),
      'StrProperty': builder => builder.call(transformStringProperty),
      'NameProperty': builder => builder.call(transformStringProperty),
      'TextProperty': builder => builder.call(transformTextProperty),
      'ByteProperty': builder => builder.call(transformByteProperty),
      'EnumProperty': builder => builder.call(transformEnumProperty),
      'ObjectProperty': builder => builder.call(transformObjectProperty),
      'StructProperty': builder => builder.call(transformStructProperty),*/
      'ArrayProperty': builder => builder.call(transformArrayProperty),
      //      'MapProperty': builder => builder.call(transformMapProperty),
      '$default': builder => builder.error(ctx => `Unknown property ${ctx.obj.type}`)


    })

}