import { SaveGame, Actor, Entity, Component, Property } from './types';
import { Archive, LoadingArchive, SavingArchive } from './Archive';
import transformProperty from './transforms/Property';
import transformExtra from './transforms/Extra';
import transformActor from './transforms/Actor';
import transformEntity from './transforms/Entity';
import transformComponent from './transforms/Component';

export function sav2json(buffer: Buffer): SaveGame {
  const saveGame: SaveGame = {
    saveHeaderType: 0,
    saveVersion: 0,
    buildVersion: 0,
    mapName: '',
    mapOptions: '',
    sessionName: '',
    playDurationSeconds: 0,
    saveDateTime: '',
    sessionVisibility: 0,
    actors: [],
    components: [],
    collected: [],
    missing: ''
  };
  transform(new LoadingArchive(buffer), saveGame);
  return saveGame;
}

export function json2sav(saveGame: SaveGame): string {
  const buffer = new SavingArchive(Buffer.from([]));
  transform(buffer, saveGame);
  return buffer.getOutput();
}

/**
 *
 * @param toSav direction in which to transform. false: sav2json, true: json2sav
 */
function transform(
  ar: Archive,
  saveGame: SaveGame
) {
  transformHeader(ar, saveGame);

  const entryCount = {
    entryCount: saveGame.actors.length + saveGame.components.length
  };
  ar.transformInt(entryCount, 'entryCount');

  for (let i = 0; i < entryCount.entryCount; i++) {
    transformActorOrComponent(ar, saveGame, i);
  }

  ar.transformInt(entryCount, 'entryCount');
  for (let i = 0; i < entryCount.entryCount; i++) {
    if (i < saveGame.actors.length) {
      const actor = saveGame.actors[i];
      transformEntity(ar, actor.entity, true, actor.className);
    } else {
      const component = saveGame.components[i - saveGame.actors.length];
      transformEntity(
        ar,
        component.entity,
        false,
        component.className
      );
    }
  }

  const collectedCount = {
    count: saveGame.collected.length
  };
  ar.transformInt(collectedCount, 'count');
  for (let i = 0; i < collectedCount.count; i++) {
    if (ar.isLoading()) {
      saveGame.collected.push({ levelName: '', pathName: '' });
    }
    ar.transformString(saveGame.collected[i], 'levelName');
    ar.transformString(saveGame.collected[i], 'pathName');
  }

  // TODO missing
}

function transformHeader(
  buffer: Archive,
  saveGame: SaveGame
) {
  buffer.transformInt(saveGame, 'saveHeaderType');
  buffer.transformInt(saveGame, 'saveVersion');
  buffer.transformInt(saveGame, 'buildVersion');
  buffer.transformString(saveGame, 'mapName');
  buffer.transformString(saveGame, 'mapOptions');
  buffer.transformString(saveGame, 'sessionName');
  buffer.transformInt(saveGame, 'playDurationSeconds');
  buffer.transformLong(saveGame, 'saveDateTime');
  if (saveGame.saveHeaderType > 4) {
    buffer.transformByte(saveGame, 'sessionVisibility');
  }
}

function transformActorOrComponent(
  ar: Archive,
  saveGame: SaveGame,
  id: number
) {
  const type = { type: id < saveGame.actors.length ? 1 : 0 };
  ar.transformInt(type, 'type');
  if (ar.isLoading()) {
    if (type.type === 1) {
      const actor = {
        type: 1,
        className: '',
        levelName: '',
        pathName: '',
        needTransform: 0,
        transform: {
          rotation: [],
          translation: [],
          scale3d: []
        },
        wasPlacedInLevel: 0,
        entity: {
          children: [],
          properties: []
        }
      };
      transformActor(ar, actor);
      saveGame.actors.push(actor);
    } else if (type.type === 0) {
      const component = {
        type: 0,
        className: '',
        levelName: '',
        pathName: '',
        outerPathName: '',
        entity: {
          properties: []
        }
      };
      transformComponent(ar, component);
      saveGame.components.push(component);
    } else {
      throw new Error(`Unknown type ${type.type}`);
    }
  } else {
    if (id < saveGame.actors.length) {
      transformActor(ar, saveGame.actors[id]);
    } else {
      transformComponent(
        ar,
        saveGame.components[id - saveGame.actors.length]
      );
    }
  }
}
