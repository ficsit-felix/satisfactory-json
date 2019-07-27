import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformVector(ar: Archive, property: StructProperty) {
    ar.transformFloat(property.value.x);
    ar.transformFloat(property.value.y);
    ar.transformFloat(property.value.z);
}
