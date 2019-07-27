import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformLinearColor(ar: Archive, property: Property) {
    ar._Float(property.value, 'r');
    ar._Float(property.value, 'g');
    ar._Float(property.value, 'b');
    ar._Float(property.value, 'a');
}
