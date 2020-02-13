import { Builder } from '../../engine/Builder';

export function transformInt64Property(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .long('value');
}
