import { Builder } from '../engine/Builder';
import { transformArrayProperty } from './properties/ArrayProperty';
import { transformFloatProperty } from './properties/FloatProperty';
import { transformIntProperty } from './properties/IntProperty';
import { transformEnumProperty } from './properties/EnumProperty';
import { transformBoolProperty } from './properties/BoolProperty';
import { transformStringProperty } from './properties/StringProperty';
import { transformObjectProperty } from './properties/ObjectProperty';
import { transformStructProperty } from './properties/StructProperty';
import { transformMapProperty } from './properties/MapProperty';
import { transformByteProperty } from './properties/ByteProperty';
import { transformTextProperty } from './properties/TextProperty';

export function transformProperty(builder: Builder): void {
  builder
    .exec(ctx => {
      ctx.obj.name = ctx.tmp._name;
    })
    .str('type') // Tag.Type
    .bufferStart('_tagSize', false) // Tag.Size
    .int('index', undefined, false) // Tag.ArrayIndex
    .switch('type', {
      IntProperty: (builder: Builder) => builder.call(transformIntProperty),
      BoolProperty: (builder: Builder) => builder.call(transformBoolProperty),
      FloatProperty: (builder: Builder) => builder.call(transformFloatProperty),
      StrProperty: (builder: Builder) => builder.call(transformStringProperty),
      NameProperty: (builder: Builder) => builder.call(transformStringProperty),
      TextProperty: (builder: Builder) => builder.call(transformTextProperty),
      ByteProperty: (builder: Builder) => builder.call(transformByteProperty),
      EnumProperty: (builder: Builder) => builder.call(transformEnumProperty),
      ObjectProperty: (builder: Builder) =>
        builder.call(transformObjectProperty),
      StructProperty: (builder: Builder) =>
        builder.call(transformStructProperty),
      ArrayProperty: (builder: Builder) => builder.call(transformArrayProperty),
      MapProperty: (builder: Builder) => builder.call(transformMapProperty),
      $default: (builder: Builder) =>
        builder.error(ctx => `Unknown property ${ctx.obj.type}`)
    })
    .bufferEnd();
}
