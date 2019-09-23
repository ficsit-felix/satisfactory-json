import { Builder } from '../../engine/Builder';

export function transformEnumProperty(builder: Builder) {
  builder
  .obj('value')
  .str('enum', false) // Tag.EnumName
  .assertNullByte(false) // Tag.HasPropertyGuid
  .str('value')
  .endObj();
}