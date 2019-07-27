import { Archive } from '../../Archive';
import { FloatProperty } from '../../types';

export default function transformFloatProperty(
    ar: Archive, property: FloatProperty) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformFloat(property.value);
}
