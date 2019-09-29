import { Builder } from '../engine/Builder';
import { transformArrayProperty } from './properties/ArrayProperty';
import { transformFloatProperty } from './properties/FloatProperty';
import { transformIntProperty } from './properties/IntProperty';
import { transformEnumProperty } from './properties/EnumProperty';
import { transformBoolProperty } from './properties/BoolProperty';
import { transformStringProperty } from './properties/StringProperty';
import { transformObjectProperty } from './properties/ObjectProperty';
import { transformStructProperty } from './properties/StructProperty';
import { transformMapProperty } from './properties/structs/MapProperty';
import { transformByteProperty } from './properties/ByteProperty';
import { transformTextProperty } from './properties/TextProperty';

export function transformProperty(builder: Builder) {
  builder
    .exec(ctx => { ctx.obj.name = ctx.tmp._name; })
    .str('type') // Tag.Type
    .bufferStart('_tagSize', false) // Tag.Size
    .int('index', undefined, false) // Tag.ArrayIndex
    .switch('type', {
      'IntProperty': builder => builder.call(transformIntProperty),
      'BoolProperty': builder => builder.call(transformBoolProperty),
      'FloatProperty': builder => builder.call(transformFloatProperty),
      'StrProperty': builder => builder.call(transformStringProperty),
      'NameProperty': builder => builder.call(transformStringProperty),
      'TextProperty': builder => builder.call(transformTextProperty),
      'ByteProperty': builder => builder.call(transformByteProperty),
      'EnumProperty': builder => builder.call(transformEnumProperty),
      'ObjectProperty': builder => builder.call(transformObjectProperty),
      'StructProperty': builder => builder.call(transformStructProperty),
      'ArrayProperty': builder => builder.call(transformArrayProperty),
      'MapProperty': builder => builder.call(transformMapProperty),
      '$default': builder => builder.error(ctx => `Unknown property ${ctx.obj.type}`)
    })
    .bufferEnd();
}