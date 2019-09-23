import { Builder } from '../../engine/Builder';
import { transformVector } from './structs/Vector';

export function transformStructProperty(builder: Builder) {
  builder
    .obj('value')
    .str('type') // Tag.StructName
    .int('_zero0', ctx => 0) // Tag.StructGuid
    .int('_zero1', ctx => 0)
    .int('_zero2', ctx => 0)
    .int('_zero3', ctx => 0)
    .exec(ctx => {
      if (ctx.vars._zero0 !== 0 || ctx.vars._zero1 !== 0 ||
        ctx.vars._zero2 !== 0 || ctx.vars._zero3 !== 0) {
        throw new Error('Struct GUID not 0');
      }
    })
    .assertNullByte(false) // Tag.HasPropertyGuid
    .switch('type', {
      'Vector': builder => transformVector(builder),
      'Rotator': builder => transformVector(builder),
      /*'Box': builder => transformBox(builder),
      'Color': builder => transformColor(builder),
      
      */
      '$default': builder => builder.error(ctx => `Unknown struct property ${ctx.obj.type}`)
    })
    .endObj();
}