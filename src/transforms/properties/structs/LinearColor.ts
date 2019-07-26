import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformLinearColor(ar: Archive, property: Property) {
    ar.transformFloat(property.value, 'r');
    ar.transformFloat(property.value, 'g');
    ar.transformFloat(property.value, 'b');
    ar.transformFloat(property.value, 'a');
}
