import { Transform, TransformCallback } from 'stream';
import { assert } from 'console';

export class Sav2JsonTransform extends Transform {

  constructor() {
    super();
    
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    // We can only handle Buffers
    assert(encoding === 'buffer');



    console.log(chunk);
    callback();
  }
}