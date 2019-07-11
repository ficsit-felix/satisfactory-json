import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformBox(buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value.min = {};
        property.value.max = {};
    }
    buffer.transformFloat(property.value.min, 0, toSav);
    buffer.transformFloat(property.value.min, 1, toSav);
    buffer.transformFloat(property.value.min, 2, toSav);
    buffer.transformFloat(property.value.max, 0, toSav);
    buffer.transformFloat(property.value.max, 1, toSav);
    buffer.transformFloat(property.value.max, 2, toSav);
    buffer.transformByte(property.value, 'isValid', toSav);
}
