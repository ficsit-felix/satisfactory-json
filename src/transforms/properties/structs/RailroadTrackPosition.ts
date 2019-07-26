import { Archive } from '../../../Archive';
import { Property } from '../../../types';
export function transformRailroadTrackPosition(
    ar: Archive, property: Property) {
    ar.transformString(property.value, 'levelName');
    ar.transformString(property.value, 'pathName');
    ar.transformFloat(property.value, 'offset');
    ar.transformFloat(property.value, 'forward');
}
