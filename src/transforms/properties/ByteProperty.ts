import { Builder } from '../../engine/Builder';

export function transformByteProperty(builder: Builder): void {
  builder
    .obj('value')
    .str('enumName', false) // Tag.EnumName
    .assertNullByte(false) // Tag.HasPropertyGuid
    .if(
      ctx => ctx.obj.enumName === 'None',
      builder => builder.byte('value'),
      builder => builder.str('valueName')
    )
    .endObj();
}
