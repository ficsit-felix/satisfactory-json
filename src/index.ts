import { SaveGame } from './types';
import { Sav2JsonTransform } from './Sav2JsonTransform';
import { Json2SavTransform } from './Json2SavTransform';

export { Sav2JsonTransform } from './Sav2JsonTransform';
export { Json2SavTransform } from './Json2SavTransform';

export * from './types';

export function sav2json(buffer: Buffer): Promise<SaveGame> {
  return new Promise<SaveGame>((resolve, _reject): void => {
    const transform = new Sav2JsonTransform();
    transform.on('data', (saveGame) => {
      resolve(saveGame);
    });
    transform.write(buffer);
    transform.end();
  });
}

export function json2sav(saveGame: SaveGame): Promise<string> {
  return new Promise<string>((resolve, _reject): void => {
    const transform = new Json2SavTransform();
    const buffers: Buffer[] = [];
    transform.on('data', (chunk) => {
      buffers.push(chunk);
    });
    transform.on('finish', () => {
      resolve(Buffer.concat(buffers).toString('binary'));
    });
    transform.write(saveGame);
    transform.end();
  });
}
