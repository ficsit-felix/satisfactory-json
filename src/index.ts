import { SaveGame } from './types';

export { Sav2JsonTransform } from './Sav2JsonTransform';

export * from './types';

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
  return saveGame;
}

