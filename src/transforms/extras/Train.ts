import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformTrain(
  ar: Archive, entity: Entity, length: number) {
  if (ar.isLoading()) {
    entity.extra = {
    };
  }

  ar.transformAssertNullInt();
  ar.transformString(entity.extra.previousLevelName);
  ar.transformString(entity.extra.previousPathName);
  ar.transformString(entity.extra.nextLevelName);
  ar.transformString(entity.extra.nextPathName);
}
