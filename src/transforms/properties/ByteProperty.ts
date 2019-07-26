import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformByteProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {};
    }
    buffer.transformString(property.value, 'enumName', toSav); // Tag.EnumName
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
    if (property.value.enumName === 'None') {
        buffer.transformByte(property.value, 'value', toSav);
    } else {
        buffer.transformString(property.value, 'valueName', toSav);
    }
}
