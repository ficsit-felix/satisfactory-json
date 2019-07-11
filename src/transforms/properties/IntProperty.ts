import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformIntProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false);
    buffer.transformInt(property, 'value', toSav);
}
