import { DataBuffer } from '../../DataBuffer';
import { Entity } from '../../types';

export default function transformTrain(
  buffer: DataBuffer, entity: Entity, toSav: boolean, length: number) {
  if (!toSav) {
    entity.extra = {
    };
  }

  buffer.transformAssertNullInt(toSav);
  buffer.transformString(entity.extra, 'previousLevelName', toSav);
  buffer.transformString(entity.extra, 'previousPathName', toSav);
  buffer.transformString(entity.extra, 'nextLevelName', toSav);
  buffer.transformString(entity.extra, 'nextPathName', toSav);
}
