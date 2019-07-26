import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformByteProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar.transformString(property.value, 'enumName'); // Tag.EnumName
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    if (property.value.enumName === 'None') {
        ar.transformByte(property.value, 'value');
    } else {
        ar.transformString(property.value, 'valueName');
    }
}
