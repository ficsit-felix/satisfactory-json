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
    ar.transformInt(circuits.length);

    for (let i = 0; i < circuits.length; i++) {
        if (ar.isLoading()) {
            entity.extra.circuits.push({});
        }
        ar.transformInt(entity.extra.circuits[i].circuitId);
        ar.transformString(entity.extra.circuits[i].levelName);
        ar.transformString(entity.extra.circuits[i].pathName);
    }
}
