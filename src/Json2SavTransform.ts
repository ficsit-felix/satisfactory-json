import { Transform, TransformCallback } from 'stream';
import {
  TransformationEngine,
  TransformResult,
} from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { CompressionTransform } from './engine/CompressionTransform';

export class Json2SavTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: CompressionTransform;

  // progressTimeoutMs is the number of milliseconds that is wait whenever a progress event is emittet, so that the GUI can draw if this is executed on the main thread
  constructor(private progressTimeoutMs: number = 15) {
    super({ writableObjectMode: true });

    this.transformationEngine = new TransformationEngine(
      transform,
      (buffer): void => {
        // write header to file
        this.push(buffer);

        this.compressionTransform = new CompressionTransform();
        this.compressionTransform.on('data', (chunk) => {
          this.push(chunk);
        });
      },
      (progress): void => {
        this.emit('progress', progress);
      }
    );

    this.transformationEngine.prepare(false);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    try {
      let continueWriting = true;
      while (continueWriting) {
        const result = this.transformationEngine.transformWrite(chunk);
        switch (result) {
          case TransformResult.WaitForNextChunk:
            continueWriting = true;
            break;
          case TransformResult.WaitForNextFrame:
            setTimeout(() => {
              this._transform(undefined, encoding, callback);
            }, this.progressTimeoutMs);
            return;
          case TransformResult.Finished:
            continueWriting = false;
            break;
        }

        // chunk is filled
        const ar = this.transformationEngine.getWriteArchive();
        if (ar) {
          for (const chunk of ar.getFilledChunks()) {
            if (this.compressionTransform !== undefined) {
              this.compressionTransform.write(chunk);
            } else {
              this.push(chunk);
            }
          }
          ar.clearFilledChunks();
        }
      }
      callback();
    } catch (error: any) {
      callback(error);
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    try {
      this.transformationEngine.end(callback);
    } catch (error: any) {
      callback(error);
    }
  }
}
