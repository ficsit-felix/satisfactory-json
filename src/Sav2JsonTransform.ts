import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';
import { TransformationEngine } from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { DecompressionTransform } from './engine/DecompressionTransform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: DecompressionTransform;

  constructor() {
    super({ readableObjectMode: true });

    console.time('buildRules');
    this.transformationEngine = new TransformationEngine(transform, (buffer) => {
      console.log('enable compression')
      this.compressionTransform = new DecompressionTransform();
      this.compressionTransform.transform(buffer, this.transformationEngine);
    });

    this.transformationEngine.prepare(true);
    console.timeEnd('buildRules');
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {

    // We can only handle Buffers
    if (encoding !== 'buffer') {
      throw new Error(`We can only handle Buffers and not ${encoding}`)
    }

    if (this.compressionTransform) {
      this.compressionTransform.transform(chunk, this.transformationEngine);
    } else {
      this.transformationEngine.transformRead(chunk);
    }
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    // @ts-ignore
    this.push(global.saveGame);
    this.transformationEngine.end(callback);

  }
}