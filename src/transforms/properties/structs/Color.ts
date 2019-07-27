import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformColor(ar: Archive, property: StructProperty) {
    ar.transformByte(property.value.b);
    ar.transformByte(property.value.g);
    ar.transformByte(property.value.r);
    ar.transformByte(property.value.a);
}
