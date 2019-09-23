import { Builder } from '../../engine/Builder';

export function transformStringProperty(builder: Builder) {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .str('value');
}