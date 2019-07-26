import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformTimerHandle(ar: Archive, property: Property) {
    ar.transformString(property.value, 'handle');
}
