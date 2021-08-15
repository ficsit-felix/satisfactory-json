import { Builder } from '../../engine/Builder';

export function transformDoubleProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .double('value');
}
