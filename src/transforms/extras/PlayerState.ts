import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformPlayerState(
    buffer: DataBuffer, entity: Entity, toSav: boolean, length: number) {
    if (!toSav) {
        entity.extra = {
        };
    }
    // read remaining data
    let count = 0;
    if (!toSav) {
        count = length - buffer.bytesRead;
    }
    buffer.transformHex(entity.extra, 'unknown', count, toSav);
}
