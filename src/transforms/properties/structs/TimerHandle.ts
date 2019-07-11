import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformTimerHandle(buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformString(property.value, 'handle', toSav);
}
