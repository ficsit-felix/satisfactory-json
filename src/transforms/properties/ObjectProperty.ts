import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformObjectProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformString(property.value, 'levelName');
    ar.transformString(property.value, 'pathName');
}
