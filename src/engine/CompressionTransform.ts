import { deflate } from 'pako';
import { Transform, TransformCallback } from 'stream';
import { writeBigInt64LE } from './Archive';
import JSBI from '../vendor/jsbi';
export class CompressionTransform extends Transform {
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
    const chunk = buffer.slice(0, this.maxChunkSize);
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
    callback();
  }
}
