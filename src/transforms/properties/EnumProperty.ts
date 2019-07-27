import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformEnumProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar._String(property.value, 'enum', false); // Tag.EnumName
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar._String(property.value, 'value');
}
