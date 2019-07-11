import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformColor(buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformByte(property.value, 'b', toSav);
    buffer.transformByte(property.value, 'g', toSav);
    buffer.transformByte(property.value, 'r', toSav);
    buffer.transformByte(property.value, 'a', toSav);
}
