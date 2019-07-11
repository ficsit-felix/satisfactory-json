import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformVector(buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformFloat(property.value, 'x', toSav);
    buffer.transformFloat(property.value, 'y', toSav);
    buffer.transformFloat(property.value, 'z', toSav);
}
