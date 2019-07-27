import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformColor(ar: Archive, property: Property) {
    ar._Byte(property.value, 'b');
    ar._Byte(property.value, 'g');
    ar._Byte(property.value, 'r');
    ar._Byte(property.value, 'a');
}
