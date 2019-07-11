import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformConveyorBelt(
    buffer: DataBuffer, entity: Entity, toSav: boolean, length: number) {
    if (!toSav) {
        entity.extra = {
            items: []
        };
    }
    const items = { length: entity.extra.items.length };
    buffer.transformInt(items, 'length', toSav);

    for (let i = 0; i < items.length; i++) {

        if (!toSav) {
            if (buffer.bytesRead >= length) {
                console.warn('Item count is ' + items.length +
                    ' while there are only ' + i + ' items in there');
                break;
            }
            entity.extra.items.push({});
        }

        buffer.transformAssertNullInt(toSav);
        buffer.transformString(entity.extra.items[i], 'name', toSav);
        buffer.transformAssertNullInt(toSav);
        buffer.transformAssertNullInt(toSav);
        buffer.transformFloat(entity.extra.items[i], 'position', toSav);
    }
}
