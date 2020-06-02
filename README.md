# satisfactory-json
Library to convert from Satisfactory save files to a JSON format and back.

## Usage
Using node streams:
```ts
import { SaveGame, Sav2JsonTransform, Json2SavTransform } from 'satisfactory-json';

// convert sav -> json
const readStream: ReadStream; // e.g. from fs.createReadStream
readStream.pipe(new Sav2JsonTransform()).on('data', saveGame => {

});

// convert json -> sav
const saveGame: SaveGame;
const writeStream: WriteStream; // e.g. from fs.createWriteStream
const transform = new Json2SavTransform();
transform.pipe(writeStream);
transform.write(saveGame);
transform.end();
```

Or using something similar to the previous interface:
```ts
import { SaveGame, sav2json, json2sav } from 'satisfactory-json';

const saveFileData: Buffer;
// convert sav -> json
sav2json(saveFileData).then((saveGame: SaveGame) => {

});

// convert json -> sav
const saveGame: SaveGame;
json2sav(saveGame).then((saveData: string) => {

});

```

---

## Notes

### Stability
This package follows the [Semantic Versioning](https://semver.org/) schema. As the major and minor version are still 0 the JSON this package creates cannot yet be considered stable and will probably change with every version. 
Progress towards a stable JSON interface can be observed at [milestone 0.1.0](https://github.com/ficsit-felix/satisfactory-json/issues?q=is%3Aopen+is%3Aissue+milestone%3A0.1.0). As Satisfactory itself is still in Early Access the save file format will also probably change in breaking ways with each new game update.

### Debugging
To debug using the cli call `yarn sav2json:debug` or `yarn json2sav:debug` and then use a node.js Inspector Client, e.g. Chrome DevTool to debug the program.