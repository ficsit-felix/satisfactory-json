import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformFloatProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false);
    buffer.transformFloat(property, 'value', toSav);
}
