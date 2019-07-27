import { Archive, LoadingArchive } from '../../Archive';
import { Entity } from '../../types';

export default function transformPlayerState(
    ar: Archive, entity: Entity, length: number) {
    if (ar.isLoading()) {
        entity.extra = {
        };
    }
    // read remaining data
    let count = 0;
    if (ar.isLoading()) {
        count = length - (ar as LoadingArchive).bytesRead;
    }
    ar.transformHex(entity.extra.unknown, count);
}
