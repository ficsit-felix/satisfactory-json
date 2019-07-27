import { Archive } from '../../Archive';
import { EnumProperty } from '../../types';

export default function transformEnumProperty(
    ar: Archive, property: EnumProperty) {
    if (ar.isLoading()) {
        property.value = {
            enum: '',
            value: ''
        };
    }
    ar.transformString(property.value.enum, false); // Tag.EnumName
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformString(property.value.value);
}
