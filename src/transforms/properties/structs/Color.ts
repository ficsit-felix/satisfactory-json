import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformColor(ar: Archive, property: Property) {
    ar.transformByte(property.value, 'b');
    ar.transformByte(property.value, 'g');
    ar.transformByte(property.value, 'r');
    ar.transformByte(property.value, 'a');
}
