# satisfactory-json
Library to convert from Satisfactory save files to a JSON format and back.

## Usage
```ts
import { SaveGame, sav2json, json2sav } from 'satisfactory-json';

const saveFileData: Buffer;
// convert sav -> json
const saveGame: SaveGame = sav2json(saveFileData);
// convert json -> sav
const saveData: string = json2sav(saveGame);
```

---

## Notes

### Stability
This package follows the [Semantic Versioning](https://semver.org/) schema. As the major and minor version are still 0 the JSON this package creates cannot yet be considered stable and will probably change with every version. 
Progress towards a stable JSON interface can be observed at [milestone 0.1.0](https://github.com/ficsit-felix/satisfactory-json/issues?q=is%3Aopen+is%3Aissue+milestone%3A0.1.0). As Satisfactory itself is still in Early Access the save file format will also probably change in breaking ways with each new game update.
