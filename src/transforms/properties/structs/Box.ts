import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformBox(ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value.min = {};
        property.value.max = {};
    }
    ar._Float(property.value.min, 0);
    ar._Float(property.value.min, 1);
    ar._Float(property.value.min, 2);
    ar._Float(property.value.max, 0);
    ar._Float(property.value.max, 1);
    ar._Float(property.value.max, 2);
    ar._Byte(property.value, 'isValid');
}
