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

### What does the preprocessor do?
The goal was to achieve bidirectional transformations from Archive to the variable as in the Unreal code. This is useful, because binary data has to be read in the same way it was written, so writing that code once saves the effort to keep the two functions in sync.
```
ar << property.name;
```

Problem is, TypeScript passes parameters by value and not by reference. The only way to be able to read or write to a variable seems to be to pass an object and a key to a variable in it:
```ts
ar.transformString(property, 'name');
```

By using strings as key we lose the most important feature of TypeScript, the Type Safety. So I wrote a preprocessor that converts the following code to the code above before sending it t the TypeScript compiler so that we can have the best of both worlds. 
```ts
ar.transformString(property.name);
```

