import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformBoolProperty(
    ar: Archive, property: Property) {
    ar.transformByte(property, 'value', false); // Tag.BoolVal
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
}
