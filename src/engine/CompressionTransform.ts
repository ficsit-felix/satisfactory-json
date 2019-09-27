import { Transform, TransformCallback } from "stream";
import { TransformationEngine } from "./TransformationEngine";
import { Archive } from "./Archive";
import { inflate, deflate } from "pako";

export class CompressionTransform extends Transform {
  private buffers: Buffer[] = [];
  private bufferedBytes: number = 0;
  private needBytes: number = 0;
  private firstRead: boolean = true;

  private maxChunkSize: number = 131072;
  private packageFileTag: bigint = 2653586369n;

  constructor() {
    super({ highWaterMark: 131072 });
  }

  _transform(buffer: Buffer, encoding: string, callback: TransformCallback) {
    this.bufferedBytes += buffer.length;
    if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    while (this.bufferedBytes >= this.maxChunkSize) {
      const chunk = buffer.slice(0, this.maxChunkSize);
      this.bufferedBytes -= this.maxChunkSize;
      const deflatedChunk = deflate(chunk);
      const chunkHeader = new Buffer(48);
      chunkHeader.writeBigInt64LE(this.packageFileTag, 0);
      chunkHeader.writeBigInt64LE(BigInt(this.maxChunkSize), 8);
      chunkHeader.writeBigInt64LE(BigInt(deflatedChunk.length), 16);
      chunkHeader.writeBigInt64LE(BigInt(chunk.length), 24);
      chunkHeader.writeBigInt64LE(BigInt(deflatedChunk.length), 32);
      chunkHeader.writeBigInt64LE(BigInt(chunk.length), 40);

      this.push(chunkHeader);
      this.push(deflatedChunk);
    }
    callback();
  }
}
