import { Builder } from '../../engine/Builder';

export function transformStringProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .str('value');
}
