import { Builder } from '../../engine/Builder';

export function transformInt8Property(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .byte('value');
}
