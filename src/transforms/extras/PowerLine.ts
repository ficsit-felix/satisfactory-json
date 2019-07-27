import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformPowerLine(ar: Archive, entity: Entity) {
    if (ar.isLoading()) {
        entity.extra = {
        };
    }
    ar._String(entity.extra, 'sourceLevelName');
    ar._String(entity.extra, 'sourcePathName');
    ar._String(entity.extra, 'targetLevelName');
    ar._String(entity.extra, 'targetPathName');
}
