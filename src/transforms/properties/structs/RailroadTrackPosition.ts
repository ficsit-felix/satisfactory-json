import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformRailroadTrackPosition(
    ar: Archive, property: Property) {
    ar._String(property.value, 'levelName');
    ar._String(property.value, 'pathName');
    ar._Float(property.value, 'offset');
    ar._Float(property.value, 'forward');
}
