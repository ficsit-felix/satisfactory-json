import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';
import { TransformationEngine } from './TransformationEngine';
import { transform } from './transform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;

  constructor() {
    super();
    this.transformationEngine = new TransformationEngine(transform);
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    // We can only handle Buffers
    assert(encoding === 'buffer');



    console.log(chunk);
    callback();
  }
}