import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformGuuid(ar: Archive, property: StructProperty) {
    ar.transformHex(property.value.value, 16);
}
