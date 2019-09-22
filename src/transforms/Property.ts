import { Builder } from '../engine/Builder';

export function transformProperty(builder: Builder) {
  builder
    .exec(ctx => { ctx.obj.name = ctx.vars._name; console.log('propertyName', ctx.obj.name) })
    .str('type') // Tag.Type
    .bufferStart('_tagSize', false) // Tag.Size
    .int('index', undefined, false) // Tag.ArrayIndex
    .switch('type', {
      'IntProperty': (builder: Builder) => builder.call(transformIntProperty),
      'BoolProperty': (builder: Builder) => builder.call(transformBoolProperty),
      'FloatProperty': (builder: Builder) => builder.call(transformFloatProperty),
      'StrProperty': (builder: Builder) => builder.call(transformStringProperty),
      'NameProperty': (builder: Builder) => builder.call(transformStringProperty),

    })

}
function transformIntProperty(builder: Builder) {

}
function transformBoolProperty(builder: Builder) {

}
function transformFloatProperty(builder: Builder) {

}
function transformStringProperty(builder: Builder) {

}