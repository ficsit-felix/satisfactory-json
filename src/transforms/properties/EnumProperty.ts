import { Builder } from '../../engine/Builder';

export function transformEnumProperty(builder: Builder): void {
  builder
    .obj('value')
    .str('enum', false) // Tag.EnumName
    .assertNullByte(false) // Tag.HasPropertyGuid
    .str('value')
    .endObj();
}
