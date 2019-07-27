import { Archive } from '../../Archive';
import { IntProperty } from '../../types';

export default function transformIntProperty(
    ar: Archive, property: IntProperty) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformInt(property.value);
}
