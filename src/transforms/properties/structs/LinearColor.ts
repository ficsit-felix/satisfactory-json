import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformLinearColor(ar: Archive, property: StructProperty) {
    ar.transformFloat(property.value.r);
    ar.transformFloat(property.value.g);
    ar.transformFloat(property.value.b);
    ar.transformFloat(property.value.a);
}
