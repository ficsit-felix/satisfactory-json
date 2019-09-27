
export class Chunk {
  public missingBytes: number = 0;
  private buffer: Buffer;
  private cursor: number = 0;
  private rollbackCursor: number = 0;
  private rollbackBytesRead: number = 0;

  // TODO pass bytesRead to the next Chunk
  private bytesRead: number = 0;
  constructor(buffer: Buffer, bytesRead: number) {
    this.buffer = buffer;
    this.bytesRead = bytesRead;
  }

  public read(bytes: number, shouldCount: boolean = true): Buffer | undefined {
    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }

    const result = this.buffer.slice(this.cursor, this.cursor + bytes);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }

  public readInt(shouldCount = true): number | undefined {
    const bytes = 4;

    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }
    const result = this.buffer.readInt32LE(this.cursor);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }

  public readStr(shouldCount = true): string | undefined {
    // store rewind point in case something gets wrong in the middle of this
    this.setRollbackPoint();
    let length = this.readInt();
    if (length === undefined) {
      return undefined;
    }
    if (length === 0) {
      return '';
    }

    let utf16 = false;
    if (length < 0) {
      // Thanks to @Goz3rr we know that this is now an utf16 based string
      length = -2 * length;
      utf16 = true;
    }
    // TODO detect EOF
    /*if (this.cursor + length > this.stream.length) {
        console.log(this.readHex(32));
        // tslint:disable-next-line: no-console
        console.trace('buffer < ' + length);
        throw new Error('cannot read string of length: ' + length);
    }*/
    let resultStr;
    if (utf16) {
      const result = this.read(length - 2);
      if (result === undefined) {
        // rewind
        this.missingBytes += this.rollback();
        return undefined;
      }
      // .slice(this.cursor, this.cursor + length - 2);
      resultStr = decodeUTF16LE(result.toString('binary'));
    } else {
      const result = this.read(length - 1);
      if (result === undefined) {
        // rewind
        this.missingBytes += this.rollback();
        return undefined;
      }
      // .slice(this.cursor, this.cursor + length - 1);
      resultStr = result.toString('utf8');
    }
    // TODO overflow
    /*      if (this.cursor < 0) {
            throw new Error('Cursor overflowed to ' + this.cursor + ' by ' + length);
          }*/
    if (utf16) {
      const result = this.readByte();
      if (result === undefined) {
        // rewind
        this.missingBytes += this.rollback();
        return undefined;
      }
      if (result !== 0) {
        throw new Error(`string(len: ${length}) does not end with zero, but with ${result}`);
      }
    }

    const result = this.readByte();
    if (result === undefined) {
      // rewind
      this.missingBytes += this.rollback();
      return undefined;
    }
    if (result !== 0) {
      throw new Error(`string(len: ${length}) does not end with zero, but with ${result}`);
    }
    return resultStr;

  }



  public readLong(shouldCount = true): bigint | undefined {
    const bytes = 8;

    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }
    const result = this.buffer.readBigInt64LE(this.cursor);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }


  public readByte(shouldCount = true): number | undefined {
    const bytes = 1;

    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }
    const result = this.buffer.readUInt8(this.cursor);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }

  public readFloat(shouldCount = true): number | undefined {
    const bytes = 4;

    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }
    const result = this.buffer.readFloatLE(this.cursor);
    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }



  public readUntil(length: number): Buffer | undefined {
    //console.log('read', length, this.bytesRead);
    return this.read(length - this.bytesRead);
  }

  public setRollbackPoint() {
    this.rollbackCursor = this.cursor;
    this.rollbackBytesRead = this.bytesRead;
  }

  public rollback(): number {
    const gainedBytes = this.cursor - this.rollbackCursor;
    this.cursor = this.rollbackCursor;
    this.bytesRead = this.rollbackBytesRead;
    return gainedBytes;
  }

  public getRemaining(): Buffer {
    return this.buffer.slice(this.cursor);
  }

  public resetBytesRead() {
    //console.log('resetBytesRead');
    this.bytesRead = 0;
  }

  public getBytesRead(): number {
    return this.bytesRead;
  }
};

// https://stackoverflow.com/a/14601808
function decodeUTF16LE(binaryStr: string): string {
  const cp = [];
  for (let i = 0; i < binaryStr.length; i += 2) {
    cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8));
  }
  return String.fromCharCode.apply(String, cp);
}