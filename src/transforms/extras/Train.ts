import { Archive } from '../../Archive';
import { Entity } from '../../types';

export default function transformTrain(
  ar: Archive, entity: Entity, length: number) {
  if (ar.isLoading()) {
    entity.extra = {
    };
  }

  ar.transformAssertNullInt();
  ar._String(entity.extra, 'previousLevelName');
  ar._String(entity.extra, 'previousPathName');
  ar._String(entity.extra, 'nextLevelName');
  ar._String(entity.extra, 'nextPathName');
}
