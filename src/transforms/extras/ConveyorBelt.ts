import { Archive, LoadingArchive } from '../../Archive';
import { Entity } from '../../types';

export default function transformConveyorBelt(
    ar: Archive, entity: Entity, length: number) {
    if (ar.isLoading()) {
        entity.extra = {
            items: []
        };
    }
    const items = { length: entity.extra.items.length };
    ar.transformInt(items.length);

    for (let i = 0; i < items.length; i++) {
        if (ar.isLoading()) {
            if ((ar as LoadingArchive).bytesRead >= length) {
                console.warn('Item count is ' + items.length +
                    ' while there are only ' + i + ' items in there');
                break;
            }
            entity.extra.items.push({});
        }

        ar.transformAssertNullInt();
        ar.transformString(entity.extra.items[i].name);
        ar.transformAssertNullInt();
        ar.transformAssertNullInt();
        ar.transformFloat(entity.extra.items[i].position);
    }
}
