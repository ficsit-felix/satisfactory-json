# satisfactory-json
Library to convert from Satisfactory save files to a JSON format and back.

## Usage
```ts
import { SaveGame, sav2json, json2sav} from 'satisfactory-json';

const saveFileData: Buffer;
// convert sav -> json
const saveGame: SaveGame = sav2json(saveFileData);
// convert json -> sav
const saveData: string = json2sav(saveGame);
```
