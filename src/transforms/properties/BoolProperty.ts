import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformBoolProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformByte(property, 'value', toSav, false); // Tag.BoolVal
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
}
