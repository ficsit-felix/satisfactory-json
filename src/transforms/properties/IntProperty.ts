import { Builder } from '../../engine/Builder';

export function transformIntProperty(builder: Builder) {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .int('value');
}