import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformQuat(buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformFloat(property.value, 'r', toSav);
    buffer.transformFloat(property.value, 'g', toSav);
    buffer.transformFloat(property.value, 'b', toSav);
    buffer.transformFloat(property.value, 'a', toSav);
}
