import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformStringProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
    buffer.transformString(property, 'value', toSav);
}
