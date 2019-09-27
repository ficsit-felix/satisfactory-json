import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './TransformationEngine';
import { Chunk } from './Chunk';
import { inflate } from 'pako';

export class DecompressionTransform {
  private buffers: Buffer[] = [];
  private bufferedBytes: number = 0;
  private needBytes: number = 0;
  private firstRead: boolean = true;
  constructor() {
  }

  transform(buffer: Buffer, transformationEngine: TransformationEngine) {
    //console.log('transform');
    this.bufferedBytes += buffer.length;
    if (this.bufferedBytes < this.needBytes) {
      this.buffers.push(buffer);
      // need to read more
      return;
    }
    if (this.buffers.length > 0) {
      // concatenate all the buffers
      this.buffers.push(buffer);
      buffer = Buffer.concat(this.buffers);
      this.buffers = [];
    }
    this.needBytes = 0;

    const chunk = new Chunk(buffer, 0);


    while (true) {
      chunk.setRollbackPoint();
      const compressedChunk = this.readChunk(chunk);
      if (compressedChunk === undefined) {
        //console.log('READ MORE: ' + chunk.missingBytes);
        // need to read more
        this.needBytes = chunk.missingBytes + chunk.rollback();
        this.buffers = [chunk.getRemaining()];
        return;
      }
      const inflated = inflate(compressedChunk);

      const uncompressedBuffer = Buffer.from(this.firstRead ? inflated.slice(4) : inflated);
      this.firstRead = false;

      transformationEngine.transform(uncompressedBuffer);
    }
  }

  readChunk(chunk: Chunk): Buffer | undefined {
    // read header
    const packageFileTag = chunk.readLong(); // c1832a9e 00000000
    if (packageFileTag === undefined) {
      return undefined;
    }
    //console.log(packageFileTag);

    const maxChunkSize = chunk.readLong();
    if (maxChunkSize === undefined) {
      return undefined;
    }

    let compressedSize = chunk.readLong();
    if (compressedSize === undefined) {
      return undefined;
    }

    let uncompressedSize = chunk.readLong();
    if (uncompressedSize === undefined) {
      return undefined;
    }


    compressedSize = chunk.readLong();
    if (compressedSize === undefined) {
      return undefined;
    }

    uncompressedSize = chunk.readLong();
    if (uncompressedSize === undefined) {
      return undefined;
    }

    // return compressedSize;
    return chunk.read(Number(compressedSize));
  }
}