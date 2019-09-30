import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { CompressionTransform } from './engine/CompressionTransform';

export class Json2SavTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: CompressionTransform;

  constructor() {
    super({ writableObjectMode: true });

    this.transformationEngine = new TransformationEngine(
      transform,
      (buffer): void => {
        // write header to file
        this.push(buffer);

        this.compressionTransform = new CompressionTransform();
        this.compressionTransform.on('data', chunk => {
          this.push(chunk);
        });
      }
    );

    this.transformationEngine.prepare(false);
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    let continueWriting = true;
    while (continueWriting) {
      continueWriting = this.transformationEngine.transformWrite(chunk);

      // chunk is filled
      const ar = this.transformationEngine.getWriteArchive();
      if (ar) {
        for (const chunk of ar.getFilledChunks()) {
          if (this.compressionTransform !== undefined) {
            this.compressionTransform.write(chunk);
            //            this.compressionTransform.push(chunk);
          } else {
            this.push(chunk);
          }
        }
        ar.clearFilledChunks();
      }
    }
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    this.transformationEngine.end(callback);
  }
}
