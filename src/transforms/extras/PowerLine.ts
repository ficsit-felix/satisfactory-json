import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformPowerLine(buffer: DataBuffer, entity: Entity, toSav: boolean) {
    if (!toSav) {
        entity.extra = {
        };
    }
    buffer.transformString(entity.extra, 'sourceLevelName', toSav);
    buffer.transformString(entity.extra, 'sourcePathName', toSav);
    buffer.transformString(entity.extra, 'targetLevelName', toSav);
    buffer.transformString(entity.extra, 'targetPathName', toSav);
}
