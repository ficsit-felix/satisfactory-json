import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformGameState(buffer: DataBuffer, entity: Entity, toSav: boolean) {
    if (!toSav) {
        entity.extra = {
            objects: []
        };
    }
    const objects = { length: entity.extra.objects.length };
    buffer.transformInt(objects, 'length', toSav);

    for (let i = 0; i < objects.length; i++) {
        if (!toSav) {
            entity.extra.objects.push({});
        }
        buffer.transformString(entity.extra.objects[i], 'levelName', toSav);
        buffer.transformString(entity.extra.objects[i], 'pathName', toSav);
    }
}
