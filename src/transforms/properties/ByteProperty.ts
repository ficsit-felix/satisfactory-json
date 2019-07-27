import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformByteProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar._String(property.value, 'enumName'); // Tag.EnumName
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    if (property.value.enumName === 'None') {
        ar._Byte(property.value, 'value');
    } else {
        ar._String(property.value, 'valueName');
    }
}
