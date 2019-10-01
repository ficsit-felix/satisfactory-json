import { deflate } from 'pako';
import { Transform, TransformCallback } from 'stream';
import { writeBigInt64LE } from './Archive';
import JSBI from 'jsbi';
export class CompressionTransform extends Transform {
  //private buffers: Buffer[] = [];
  //private bufferedBytes: number = 0;

  private maxChunkSize = 131072;
  private packageFileTag = JSBI.BigInt('2653586369');

  constructor() {
    super({ highWaterMark: 131072 });
  }

  _transform(
    buffer: Buffer,
    encoding: string,
    callback: TransformCallback
  ): void {
    //this.bufferedBytes += buffer.length;
    /*if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    while (this.bufferedBytes >= this.maxChunkSize) {*/
    const chunk = buffer.slice(0, this.maxChunkSize);
    //this.bufferedBytes -= this.maxChunkSize;
    const deflatedChunk = deflate(chunk);
    const chunkHeader = Buffer.alloc(48);
    writeBigInt64LE(chunkHeader, this.packageFileTag, 0);
    writeBigInt64LE(chunkHeader, JSBI.BigInt(this.maxChunkSize), 8);
    writeBigInt64LE(chunkHeader, JSBI.BigInt(deflatedChunk.length), 16);
    writeBigInt64LE(chunkHeader, JSBI.BigInt(chunk.length), 24);
    writeBigInt64LE(chunkHeader, JSBI.BigInt(deflatedChunk.length), 32);
    writeBigInt64LE(chunkHeader, JSBI.BigInt(chunk.length), 40);

    this.push(chunkHeader);
    this.push(deflatedChunk);
    //}
    callback();
  }
}
