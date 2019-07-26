import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformFloatProperty(
    ar: Archive, property: Property) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformFloat(property, 'value');
}
