import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './TransformationEngine';
import { Chunk } from './Chunk';
import { inflate, deflate } from 'pako';

export class CompressionTransform extends Transform {
  private buffers: Buffer[] = [];
  private bufferedBytes: number = 0;
  private needBytes: number = 0;
  private firstRead: boolean = true;

  private chunkSize: number = 131072;
  private packageFileTag: number = -1641380927;

  constructor() {
    super();
  }

  _transform(buffer: Buffer, encoding: string, callback: TransformCallback) {
    this.bufferedBytes += buffer.length;
    if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    while (this.bufferedBytes >= this.chunkSize) {
      const chunk = buffer.slice(this.chunkSize);
      this.bufferedBytes -= this.chunkSize;
      const deflatedChunk = deflate(chunk);
      const chunkHeader = new Buffer(48);
      chunkHeader.writeInt32LE(this.packageFileTag, 0);
      chunkHeader.writeInt32LE(0, 4); // uncompressedOffset
      chunkHeader.writeInt32LE(this.chunkSize, 8); // uncompressedSize
      chunkHeader.writeInt32LE(0, 12); // compressedOffset
      chunkHeader.writeInt32LE(deflatedChunk.length, 16); // compressedSize

      for (let i = 0; i < 7; i++) {
        chunkHeader.writeInt32LE(0, 20 + i);
      }

      this.push(chunkHeader);
      this.push(deflatedChunk);
    }
    callback();
  }
}