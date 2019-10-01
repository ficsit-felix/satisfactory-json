import { Builder } from '../../engine/Builder';

export function transformObjectProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .obj('value')
    .str('levelName')
    .str('pathName')
    .endObj();
}
