import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformCircuitSubsystem(
    ar: Archive, entity: Entity) {
    if (ar.isLoading()) {
        entity.extra = {
            circuits: []
        };
    }
    const circuits = { length: entity.extra.circuits.length };
    ar._Int(circuits, 'length');

    for (let i = 0; i < circuits.length; i++) {
        if (ar.isLoading()) {
            entity.extra.circuits.push({});
        }
        ar._Int(entity.extra.circuits[i], 'circuitId');
        ar._String(entity.extra.circuits[i], 'levelName');
        ar._String(entity.extra.circuits[i], 'pathName');
    }
}
