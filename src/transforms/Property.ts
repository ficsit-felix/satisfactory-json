import { Builder } from '../engine/Builder';
import { RegisteredFunction } from '../engine/TransformationEngine';

export function transformProperty(builder: Builder): void {
  builder
    .exec((ctx) => {
      ctx.obj.name = ctx.tmp._name;
    })
    .str('type') // Tag.Type
    .bufferStart('_tagSize', false) // Tag.Size
    .int('index', undefined, false) // Tag.ArrayIndex

    .switch('type', {
      IntProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformIntProperty),
      BoolProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformBoolProperty),
      FloatProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformFloatProperty),
      StrProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformStringProperty),
      NameProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformStringProperty),
      TextProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformTextProperty),
      ByteProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformByteProperty),
      EnumProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformEnumProperty),
      ObjectProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformObjectProperty),
      StructProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformStructProperty),
      ArrayProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformArrayProperty),
      MapProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformMapProperty),
      SetProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformSetProperty),
      Int64Property: (builder: Builder) =>
        builder.call(RegisteredFunction.transformInt64Property),
      InterfaceProperty: (builder: Builder) =>
        builder.call(RegisteredFunction.transformObjectProperty),
      Int8Property: (builder: Builder) =>
        builder.call(RegisteredFunction.transformInt8Property),
      $default: (builder: Builder) =>
        builder.error((ctx) => `Unknown property: ${ctx.obj.type}`),
    })
    .bufferEnd();
}
