import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformEnumProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {};
    }
    buffer.transformString(property.value, 'enum', toSav, false); // Tag.EnumName
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
    buffer.transformString(property.value, 'value', toSav);
}
