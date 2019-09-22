import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';
import { TransformationEngine } from './TransformationEngine';
import { transform } from './transform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;

  constructor() {
    super();
    this.transformationEngine = new TransformationEngine(transform);
    
    this.transformationEngine.prepare(true);
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    // We can only handle Buffers
    assert(encoding === 'buffer');

    this.transformationEngine.transform(chunk, callback);
  }
}