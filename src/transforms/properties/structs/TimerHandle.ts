import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformTimerHandle(ar: Archive, property: Property) {
    ar._String(property.value, 'handle');
}
