import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformBoolProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformByte(property, 'value', toSav, false);
    buffer.transformAssertNullByte(toSav, false);
}
