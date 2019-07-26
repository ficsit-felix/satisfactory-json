import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformBox(ar: Archive, property: Property) {
    if (ar.isLoading()) {
        property.value.min = {};
        property.value.max = {};
    }
    ar.transformFloat(property.value.min, 0);
    ar.transformFloat(property.value.min, 1);
    ar.transformFloat(property.value.min, 2);
    ar.transformFloat(property.value.max, 0);
    ar.transformFloat(property.value.max, 1);
    ar.transformFloat(property.value.max, 2);
    ar.transformByte(property.value, 'isValid');
}
