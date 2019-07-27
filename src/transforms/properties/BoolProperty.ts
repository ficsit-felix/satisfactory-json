import { Archive } from '../../Archive';
import { BoolProperty } from '../../types';

export default function transformBoolProperty(
    ar: Archive, property: BoolProperty) {
    ar.transformByte(property.value, false); // Tag.BoolVal
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
}
