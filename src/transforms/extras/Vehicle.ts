import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformVehicle(ar: Archive, entity: Entity) {
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
        ar._String(entity.extra.objects[i], 'name');
        ar._Hex(entity.extra.objects[i], 'unknown', 53);
    }
}
