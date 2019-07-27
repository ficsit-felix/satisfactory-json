import { Archive } from '../../../Archive';
import { StructProperty } from '../../../types';
export function transformRailroadTrackPosition(
    ar: Archive, property: StructProperty) {
    ar.transformString(property.value.levelName);
    ar.transformString(property.value.pathName);
    ar.transformFloat(property.value.offset);
    ar.transformFloat(property.value.forward);
}
