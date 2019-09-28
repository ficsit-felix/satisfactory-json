import { Transform, TransformCallback } from 'stream';
import { TransformationEngine } from './TransformationEngine';
import { Archive, ReadArchive } from './Archive';
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

    const chunk = new ReadArchive(buffer, 0);


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

      console.log('first 4 bytes', Buffer.from(inflated.slice(0, 4)).readInt32LE(0));

      const uncompressedBuffer = Buffer.from(this.firstRead ? inflated.slice(4) : inflated);
      this.firstRead = false;

      transformationEngine.transformRead(uncompressedBuffer);
    }
  }

  readChunk(chunk: ReadArchive): Buffer | undefined {
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