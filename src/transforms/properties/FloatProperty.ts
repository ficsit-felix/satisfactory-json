import { Builder } from '../../engine/Builder';

export function transformFloatProperty(builder: Builder) {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .float('value');
}