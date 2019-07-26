import { Archive, LoadingArchive } from '../../Archive';
import { Entity } from '../../types';

export default function transformRailroadSubsystem(
    ar: Archive, entity: Entity, length: number) {
    if (ar.isSaving()) {
        // Workaround for broken savegames in the experimental version
        if (entity.extra === undefined) { // TODO if saveHeaderVersion >= 6
            return;
        }
    } else {
        // Workaround for broken savegames in the experimental version
        if ((ar as LoadingArchive).bytesRead >= length) {
            // TODO replace with if saveHeaderType >= 6
            return;
        }
        entity.extra = {
            trains: []
        };
    }
    const trains = { length: entity.extra.trains.length };
    ar.transformInt(trains, 'length');

    for (let i = 0; i < trains.length; i++) {
        if (ar.isLoading()) {
            entity.extra.trains.push({});
        }

        ar.transformHex(entity.extra.trains[i], 'unknown', 4);
        ar.transformString(entity.extra.trains[i], 'firstLevelName');
        ar.transformString(entity.extra.trains[i], 'firstPathName');
        ar.transformString(entity.extra.trains[i], 'secondLevelName');
        ar.transformString(entity.extra.trains[i], 'secondPathName');
        ar.transformString(entity.extra.trains[i], 'timetableLevelName');
        ar.transformString(entity.extra.trains[i], 'timetablePathName');
    }
}
