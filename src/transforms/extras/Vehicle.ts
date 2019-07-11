import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformVehicle(buffer: DataBuffer, entity: Entity, toSav: boolean) {
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
        buffer.transformString(entity.extra.objects[i], 'name', toSav);
        buffer.transformHex(entity.extra.objects[i], 'unknown', 53, toSav);
    }
}
