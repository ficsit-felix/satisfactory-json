import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformVehicle(ar: Archive, entity: Entity) {
    if (ar.isLoading()) {
        entity.extra = {
            objects: []
        };
    }
    const objects = { length: entity.extra.objects.length };
    ar.transformInt(objects, 'length');

    for (let i = 0; i < objects.length; i++) {

        if (ar.isLoading()) {
            entity.extra.objects.push({});
        }
        ar.transformString(entity.extra.objects[i], 'name');
        ar.transformHex(entity.extra.objects[i], 'unknown', 53);
    }
}
