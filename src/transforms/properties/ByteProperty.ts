import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformByteProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {};
    }
    buffer.transformString(property.value, 'unk1', toSav); // Tag.EnumName
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
    if (property.value.unk1 === 'None') {
        buffer.transformByte(property.value, 'unk2', toSav);
    } else {
        buffer.transformString(property.value, 'unk2', toSav);
    }
}
