import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformTextProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false);
    buffer.transformInt(property, 'unknown1', toSav);
    buffer.transformByte(property, 'unknown2', toSav);
    buffer.transformInt(property, 'unknown3', toSav);
    buffer.transformString(property, 'unknown4', toSav);
    buffer.transformString(property, 'value', toSav);
}
