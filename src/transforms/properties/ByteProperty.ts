import { Archive } from '../../Archive';
import { ByteProperty } from '../../types';

export default function transformByteProperty(
    ar: Archive, property: ByteProperty) {
    if (ar.isLoading()) {
        property.value = {
            enumName: ''
        };
    }
    ar.transformString(property.value.enumName); // Tag.EnumName
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    if (property.value.enumName === 'None') {
        ar.transformByte(property.value.value!);
    } else {
        ar.transformString(property.value.valueName!);
    }
}
