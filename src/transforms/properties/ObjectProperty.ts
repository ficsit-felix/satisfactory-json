import { Archive } from '../../Archive';
import { ObjectProperty } from '../../types';

export default function transformObjectProperty(
    ar: Archive, property: ObjectProperty) {
    if (ar.isLoading()) {
        property.value = {
            levelName: '',
            pathName: ''
        };
    }
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    ar.transformString(property.value.levelName);
    ar.transformString(property.value.pathName);
}
