import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformCircuitSubsystem(
    buffer: DataBuffer, entity: Entity, toSav: boolean) {
    if (!toSav) {
        entity.extra = {
            circuits: []
        };
    }
    const circuits = { length: entity.extra.circuits.length };
    buffer.transformInt(circuits, 'length', toSav);

    for (let i = 0; i < circuits.length; i++) {
        if (!toSav) {
            entity.extra.circuits.push({});
        }
        buffer.transformInt(entity.extra.circuits[i], 'circuitId', toSav);
        buffer.transformString(entity.extra.circuits[i], 'levelName', toSav);
        buffer.transformString(entity.extra.circuits[i], 'pathName', toSav);
    }
}
