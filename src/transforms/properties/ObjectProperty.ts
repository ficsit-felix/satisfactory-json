import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

export default function transformObjectProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    if (!toSav) {
        property.value = {};
    }
    buffer.transformAssertNullByte(toSav, false);
    buffer.transformString(property.value, 'levelName', toSav);
    buffer.transformString(property.value, 'pathName', toSav);
}
