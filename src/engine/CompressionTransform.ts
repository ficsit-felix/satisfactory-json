import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './TransformationEngine';
import { Chunk } from './Chunk';
import { inflate } from 'pako';

export class CompressionTransform {
  private buffers: Buffer[] = [];
  private bufferedBytes: number = 0;
  private needBytes: number = 0;
  private firstRead: boolean = true;
  constructor() {
  }

  transform(buffer: Buffer, transformationEngine: TransformationEngine) {
    console.log('transform');
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
        console.log('READ MORE: ' + chunk.missingBytes);
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
    const packageFileTag = chunk.readInt(); // c1832a9e
    if (packageFileTag === undefined) {
      return undefined;
    }
    //console.log(packageFileTag);

    const uncompressedOffset = chunk.readInt();
    if (uncompressedOffset === undefined) {
      return undefined;
    }
    const uncompressedSize = chunk.readInt();
    if (uncompressedSize === undefined) {
      return undefined;
    }

    const compressedOffset = chunk.readInt();
    if (compressedOffset === undefined) {
      return undefined;
    }
    const compressedSize = chunk.readInt();
    if (compressedSize === undefined) {
      return undefined;
    }
    const rest = chunk.read(7 * 4); // TODO find out more
    if (rest === undefined) {
      return undefined;
    }

    // return compressedSize;
    return chunk.read(compressedSize);
  }
}