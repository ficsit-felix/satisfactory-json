import { Builder } from '../../engine/Builder';

export function transformFloatProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .float('value');
}
