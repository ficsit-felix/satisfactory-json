import { Transform, TransformCallback } from 'stream';
import {
  TransformationEngine,
  TransformResult,
} from './engine/TransformationEngine';
import { transform } from './transforms/transform';
import { DecompressionTransform } from './engine/DecompressionTransform';

export class Sav2JsonTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: DecompressionTransform;

  // progressTimeoutMs is the number of milliseconds that is wait whenever a progress event is emittet, so that the GUI can draw if this is executed on the main thread
  constructor(private progressTimeoutMs: number = 15) {
    super({ readableObjectMode: true });

    //console.time('buildRules');
    this.transformationEngine = new TransformationEngine(
      transform,
      (buffer): void => {
        //console.log('enable compression')
        this.compressionTransform = new DecompressionTransform();
        this._transform(buffer, 'buffer', () => {});
      },
      (progress): void => {
        this.emit('progress', progress);
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

      let result;
      if (this.compressionTransform) {
        result = this.compressionTransform.transform(
          chunk,
          this.transformationEngine
        );
      } else {
        result = this.transformationEngine.transformRead(chunk);
      }

      switch (result) {
        case TransformResult.WaitForNextChunk:
          callback();
          break;
        case TransformResult.Finished:
          callback();
          break;
        case TransformResult.WaitForNextFrame:
          setTimeout(() => {
            this._transform(undefined, encoding, callback);
          }, this.progressTimeoutMs);
          break;
      }
    } catch (error) {
      callback(error);
    }
  }

  _final(callback: (error?: Error | null) => void): void {
    try {
      this.transformationEngine.end((error?: Error) => {
        if (error === undefined) {
          this.push(this.transformationEngine.getSaveGame());
        }

        callback(error);
      });
    } catch (error) {
      callback(error);
    }
  }
}
