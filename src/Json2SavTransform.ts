import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';
import { TransformationEngine } from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { CompressionTransform } from './engine/CompressionTransform';

export class Json2SavTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: CompressionTransform;

  constructor() {
    super({ writableObjectMode: true });

    console.time('buildRules');
    this.transformationEngine = new TransformationEngine(transform, (buffer) => {
      console.log('enable compression')
      this.compressionTransform = new CompressionTransform();
      //this.compressionTransform.transform(buffer, this.transformationEngine);
    });

    this.transformationEngine.prepare(true);
    console.timeEnd('buildRules');
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {

    console.log(encoding);

    /*if (this.compressionTransform) {
      this.compressionTransform._transform(chunk, this.transformationEngine);
    } else {
      this.transformationEngine.transform(chunk);
    }*/
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    // @ts-ignore
    this.push(global.saveGame);
    this.transformationEngine.end(callback);

  }
}