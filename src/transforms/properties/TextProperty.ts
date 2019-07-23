import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformTextProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false);
    if (!toSav) {
        property.value = {};
    }
    buffer.transformInt(property.value, 'unknown1', toSav);
    buffer.transformByte(property.value, 'unknown2', toSav);
    if (property.value.unknown2 === 0) {
        buffer.transformString(property.value, 'unknown3', toSav);
        buffer.transformString(property.value, 'unknown4', toSav);
        buffer.transformString(property.value, 'text', toSav);
    } else if (property.value.unknown2 === 255) {
        // this is the end of the property, no value ?
    } else {
        throw new Error('Unknown value for TextProperty unknown2: ' + property.value.unknown2);
    }
}
