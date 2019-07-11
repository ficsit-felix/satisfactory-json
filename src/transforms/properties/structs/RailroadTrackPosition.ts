import { DataBuffer } from '../../../DataBuffer';
import { Property } from '../../../types';
export function transformRailroadTrackPosition(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformString(property.value, 'levelName', toSav);
    buffer.transformString(property.value, 'pathName', toSav);
    buffer.transformFloat(property.value, 'offset', toSav);
    buffer.transformFloat(property.value, 'forward', toSav);
}
