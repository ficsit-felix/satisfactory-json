import { Transform, TransformCallback } from "stream";
import { assert } from "console";
import { TransformationEngine } from "./engine/TransformationEngine";
import { transform } from "./transforms/transform";
import { CompressionTransform } from "./engine/CompressionTransform";

export class Json2SavTransform extends Transform {
  private transformationEngine: TransformationEngine;
  private compressionTransform?: CompressionTransform;

  constructor() {
    super({ writableObjectMode: true });

    console.time("buildRules");
    this.transformationEngine = new TransformationEngine(transform, buffer => {
      console.log("enable compression");

      // write header to file
      this.push(buffer);

      this.compressionTransform = new CompressionTransform();
      this.compressionTransform.on("data", chunk => {
        this.push(chunk);
      });
    });

    this.transformationEngine.prepare(false);
    console.timeEnd("buildRules");
  }

  _transform(chunk: any, encoding: string, callback: TransformCallback): void {
    console.log(encoding);
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
    console.log('---fin---');
    // @ts-ignore
    this.transformationEngine.end(callback);
  }
}
