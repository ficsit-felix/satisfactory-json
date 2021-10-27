import { inflate } from 'pako';
import { ReadArchive } from './Archive';
import { TransformationEngine, TransformResult } from './TransformationEngine';
import JSBI from 'jsbi';

export class DecompressionTransform {
  private buffers: Buffer[] = [];
  private bufferedBytes = 0;
  private needBytes = 0;
  private firstRead = true;
  private chunk!: ReadArchive;
  private uncompressedBuffer?: Buffer;

  transform(
    buffer: Buffer,
    transformationEngine: TransformationEngine
  ): TransformResult {
    let result;
    if (buffer !== undefined) {
      this.bufferedBytes += buffer.length;
      if (this.bufferedBytes < this.needBytes) {
        this.buffers.push(buffer);
        // need to read more
        return TransformResult.WaitForNextChunk;
      }
      if (this.buffers.length > 0) {
        // concatenate all the buffers
        this.buffers.push(buffer);
        buffer = Buffer.concat(this.buffers);
        this.buffers = [];
      }
      this.needBytes = 0;

      this.chunk = new ReadArchive(
        buffer,
        0,
        transformationEngine.progressCallback
      );
    }
    for (;;) {
      if (this.uncompressedBuffer === undefined) {
        this.chunk.setRollbackPoint();
        const compressedChunk = this.readChunk(this.chunk);
        if (compressedChunk === undefined) {
          // need to read more
          this.needBytes = this.chunk.missingBytes + this.chunk.rollback();
          this.buffers = [this.chunk.getRemaining()];
          return TransformResult.WaitForNextChunk;
        }
        const inflated = inflate(compressedChunk);

        this.uncompressedBuffer = Buffer.from(inflated);
        this.firstRead = false;
        result = transformationEngine.transformRead(this.uncompressedBuffer);
      } else {
        result = transformationEngine.transformRead(undefined);
      }

      switch (result) {
        case TransformResult.WaitForNextChunk:
          this.uncompressedBuffer = undefined;
          continue;
        case TransformResult.WaitForNextFrame:
          return result;
        case TransformResult.Finished:
          return result;
      }
    }
  }

  readChunk(chunk: ReadArchive): Buffer | undefined {
    // read header
    const packageFileTag = chunk.readLong(); // c1832a9e 00000000
    if (packageFileTag === undefined) {
      return undefined;
    }

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

    return chunk.read(JSBI.toNumber(compressedSize));
  }
}
