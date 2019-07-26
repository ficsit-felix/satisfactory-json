import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformPowerLine(ar: Archive, entity: Entity) {
    if (ar.isLoading()) {
        entity.extra = {
        };
    }
    ar.transformString(entity.extra, 'sourceLevelName');
    ar.transformString(entity.extra, 'sourcePathName');
    ar.transformString(entity.extra, 'targetLevelName');
    ar.transformString(entity.extra, 'targetPathName');
}
