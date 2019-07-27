import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformGameState(ar: Archive, entity: Entity) {
    if (ar.isLoading()) {
        entity.extra = {
            objects: []
        };
    }
    const objects = { length: entity.extra.objects.length };
    ar._Int(objects, 'length');

    for (let i = 0; i < objects.length; i++) {
        if (ar.isLoading()) {
            entity.extra.objects.push({});
        }
        ar._String(entity.extra.objects[i], 'levelName');
        ar._String(entity.extra.objects[i], 'pathName');
    }
}
