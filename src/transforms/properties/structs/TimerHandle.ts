import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformTimerHandle(ar: Archive, property: StructProperty) {
    ar.transformString(property.value.handle);
}
