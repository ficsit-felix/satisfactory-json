import { Builder } from '../../engine/Builder';

export function transformIntProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .int('value');
}
