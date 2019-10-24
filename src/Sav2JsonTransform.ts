import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { DecompressionTransform } from './engine/DecompressionTransform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: DecompressionTransform;

  constructor() {
    super({ readableObjectMode: true });

    //console.time('buildRules');
    this.transformationEngine = new TransformationEngine(
      transform,
      (buffer): void => {
        //console.log('enable compression')
        this.compressionTransform = new DecompressionTransform();
        this.compressionTransform.transform(buffer, this.transformationEngine);
      }
    );

    this.transformationEngine.prepare(true);
    //console.timeEnd('buildRules');
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    try {
      // We can only handle Buffers
      if (encoding !== 'buffer') {
        throw new Error(`We can only handle Buffers and not ${encoding}`);
      }

      if (this.compressionTransform) {
        this.compressionTransform.transform(chunk, this.transformationEngine);
      } else {
        this.transformationEngine.transformRead(chunk);
      }
      callback();
    } catch (error) {
      callback(error);
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    try {
      this.transformationEngine.end((error?: Error) => {
        if (error === undefined) {
          console.log('push data', error);
          this.push(this.transformationEngine.getSaveGame());
        }

        callback(error);
      });
    } catch (error) {
      callback(error);
    }
  }
}
