import { Archive, SavingArchive, LoadingArchive } from '../Archive';
import { Entity, Property } from '../types';
import transformProperty from './Property';
import transformExtra from './Extra';

export default function transformEntity(
  ar: Archive,
  entity: Entity,
  withNames: boolean,
  className: string
) {
  const length = ar.transformBufferStart(true);

  if (withNames) {
    ar.transformString(entity, 'levelName');
    ar.transformString(entity, 'pathName');
    const childCount = { count: entity.children!.length };
    ar.transformInt(childCount, 'count');
    for (let i = 0; i < childCount.count; i++) {
      if (ar.isLoading()) {
        entity.children!.push({ levelName: '', pathName: '' });
      }
      ar.transformString(entity.children![i], 'levelName');
      ar.transformString(entity.children![i], 'pathName');
    }
  }

  transformProperties(ar, entity);

  const extraObjectCount = { count: 0 };
  ar.transformInt(extraObjectCount, 'count');
  if (extraObjectCount.count !== 0) {
    throw Error(`Extra object count not zero, but ${extraObjectCount.count}`);
  }

  // read extra
  transformExtra(ar, entity, className, length);

  // read missing
  if (ar.isSaving()) {
    if (entity.missing !== undefined) {
      (ar as SavingArchive).writeHex(entity.missing);
    }
  } else {
    const missing = length - (ar as LoadingArchive).bytesRead;
    if (missing > 0) {
      entity.missing = (ar as LoadingArchive).readHex(missing);
      console.warn(
        'missing data found in entity of type ' +
        className +
        ': ' +
        entity.missing
      );
    } else if (missing < 0) {
      throw Error(
        'negative missing amount in entity of type ' +
        className +
        ': ' +
        missing
      );
    }
  }
  ar.transformBufferEnd();
}

function transformProperties(
  ar: Archive,
  entity: Entity
) {
  if (ar.isSaving()) {
    for (const property of entity.properties) {
      ar.transformString(property, 'name'); // Tag.Name
      transformProperty(ar, property);
    }
    (ar as SavingArchive).writeLengthPrefixedString('None'); // end of properties
  } else {
    // read properties
    while (true) {
      const property: Property = {
        name: '',
        type: '',
        index: 0,
        value: ''
      };
      ar.transformString(property, 'name'); // Tag.Name
      if (property.name === 'None') {
        break; // end of properties
      }

      transformProperty(ar, property);
      entity.properties.push(property);
    }
  }
}
