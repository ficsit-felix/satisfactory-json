import { Archive } from '../../Archive';
import { Property } from '../../types';

export default function transformObjectProperty(
    ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value = {};
    }
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar._String(property.value, 'levelName');
    ar._String(property.value, 'pathName');
}
