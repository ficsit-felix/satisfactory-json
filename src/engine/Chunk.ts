
export class Chunk {
  private buffer: Buffer;
  private cursor: number = 0;
  private rollbackCursor: number = 0;

  // TODO pass bytesRead to the next Chunk
  private bytesRead: number = 0;
  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  public read(bytes: number, shouldCount: boolean = true): Buffer | number {
    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      return this.cursor + bytes - this.buffer.length;
    }

    const result = this.buffer.slice(this.cursor, this.cursor + bytes);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }

  public readUntil(length: number): Buffer | number {
    //console.log('read', length, this.bytesRead);
    return this.read(length - this.bytesRead);
  }

  public setRollbackPoint() {
    this.rollbackCursor = this.cursor;
  }

  public rollback(): number {
    const gainedBytes = this.cursor - this.rollbackCursor;
    this.cursor = this.rollbackCursor;
    return gainedBytes;
  }

  public getRemaining(): Buffer {
    return this.buffer.slice(this.cursor);
  }

  public resetBytesRead() {
    this.bytesRead = 0;
  }
};