import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformVector(ar: Archive, property: Property) {
    ar._Float(property.value, 'x');
    ar._Float(property.value, 'y');
    ar._Float(property.value, 'z');
}
