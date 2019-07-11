import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformRailroadSubsystem(
    buffer: DataBuffer, entity: Entity, toSav: boolean) {
    if (!toSav) {
        entity.extra = {
            trains: []
        };
    }
    if (toSav) {
        // Workaround for broken savegames in the experimental version
        if (entity.extra === undefined) { // TODO if saveHeaderVersion >= 6
            return;
        }
    }
    const trains = { length: entity.extra.trains.length };
    buffer.transformInt(trains, 'length', toSav);

    for (let i = 0; i < trains.length; i++) {
        if (!toSav) {
            entity.extra.trains.push({});
        }

        buffer.transformHex(entity.extra.trains[i], 'unknown', 4, toSav);
        buffer.transformString(entity.extra.trains[i], 'firstLevelName', toSav);
        buffer.transformString(entity.extra.trains[i], 'firstPathName', toSav);
        buffer.transformString(entity.extra.trains[i], 'secondLevelName', toSav);
        buffer.transformString(entity.extra.trains[i], 'secondPathName', toSav);
        buffer.transformString(entity.extra.trains[i], 'timetableLevelName', toSav);
        buffer.transformString(entity.extra.trains[i], 'timetablePathName', toSav);
    }
}
