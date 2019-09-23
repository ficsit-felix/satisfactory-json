import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';
import { TransformationEngine } from './engine/TransformationEngine';
import { transform } from './transforms/transform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;

  constructor() {
    super();
    console.time('buildRules');
    this.transformationEngine = new TransformationEngine(transform);

    this.transformationEngine.prepare(true);
    console.timeEnd('buildRules');
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    // We can only handle Buffers
    assert(encoding === 'buffer');

    this.transformationEngine.transform(chunk, callback);
  }

  _final(callback: (error?: Error | null) => void): void {

    this.transformationEngine.end(callback);
  }
}