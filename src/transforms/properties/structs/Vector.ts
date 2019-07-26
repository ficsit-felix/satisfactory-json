import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformVector(ar: Archive, property: Property) {
    ar.transformFloat(property.value, 'x');
    ar.transformFloat(property.value, 'y');
    ar.transformFloat(property.value, 'z');
}
