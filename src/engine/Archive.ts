import { Context, Reference, ReferenceType } from './commands';
import JSBI from '../vendor/jsbi';

// Polyfill for browser until https://github.com/feross/buffer/pull/247 is merged
/* eslint-disable */
export function readBigInt64LE(buffer: Buffer, offset = 0) {
  const first = buffer[offset];
  const last = buffer[offset + 7];
  const val =
    buffer[offset + 4] +
    buffer[offset + 5] * 2 ** 8 +
    buffer[offset + 6] * 2 ** 16 +
    (last << 24); // Overflow

  return JSBI.add(
    JSBI.leftShift(JSBI.BigInt(val), JSBI.BigInt(32)),
    JSBI.BigInt(
      first +
      buffer[++offset] * 2 ** 8 +
      buffer[++offset] * 2 ** 16 +
      buffer[++offset] * 2 ** 24
    )
  );
}

function wrtBigUInt64LE(
  buf: Buffer | number[],
  value: JSBI,
  offset: number,
  min: JSBI,
  max: JSBI
) {
  let lo = Number(JSBI.bitwiseAnd(value, JSBI.BigInt("0xffffffff")));
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  lo = lo >> 8;
  buf[offset++] = lo;
  let hi = Number(
    JSBI.bitwiseAnd(
      JSBI.signedRightShift(value, JSBI.BigInt(32)),
      JSBI.BigInt("0xffffffff")
    )
  );
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  hi = hi >> 8;
  buf[offset++] = hi;
  return offset;
}
export function writeBigInt64LE(buffer: Buffer, value: JSBI, offset = 0) {
  return wrtBigUInt64LE(
    buffer,
    value,
    offset,
    JSBI.unaryMinus(JSBI.BigInt("0x8000000000000000")),
    JSBI.BigInt("0x7fffffffffffffff")
  );
}
/* eslint-enable */

export abstract class Archive {
  public missingBytes = 0;
  public abstract transformInt(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean,
    defaultValue?: (ctx: Context) => number
  ): boolean;

  public abstract transformStr(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean;

  public abstract transformLong(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean;

  public abstract transformByte(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean;

  public abstract transformFloat(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean;

  public abstract assertNullByte(ctx: Context, shouldCount: boolean): boolean;

  public abstract transformHex(
    ctx: Context,
    ref: Reference,
    bytes: number,
    shouldCount: boolean
  ): boolean;

  public abstract transformHexRemaining(
    ctx: Context,
    ref: Reference,
    lengthRef: Reference,
    shouldCount: boolean
  ): boolean;

  public abstract startBuffer(
    ctx: Context,
    ref: Reference,
    resetBytesRead: boolean
  ): boolean;
  public abstract endBuffer(ctx: Context): boolean;

  public abstract endSaveGame(): void;
  public abstract emitProgress(progress: number): void;
}

function setVar(ctx: Context, ref: Reference, value: any): void {
  switch (ref.type) {
    case ReferenceType.OBJ:
      ctx.obj[ref.name] = value;
      break;
    case ReferenceType.TMP:
      ctx.tmp[ref.name] = value;
      break;
    case ReferenceType.INDIRECT_OBJ:
      ctx.obj[ctx.obj[ref.name]] = value;
      break;
    case ReferenceType.INDIRECT_TMP:
      ctx.obj[ctx.tmp[ref.name]] = value;
      break;
  }
}

function getVar(ctx: Context, ref: Reference): any {
  switch (ref.type) {
    case ReferenceType.OBJ:
      return ctx.obj[ref.name];
    case ReferenceType.TMP:
      return ctx.tmp[ref.name];
    case ReferenceType.INDIRECT_OBJ:
      return ctx.obj[ctx.obj[ref.name]];
    case ReferenceType.INDIRECT_TMP:
      return ctx.obj[ctx.tmp[ref.name]];
  }
}

export class ReadArchive extends Archive {
  public transformStr(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const result = this.readStr(shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result);

    return true;
  }
  public transformLong(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const result = this.readLong(shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result.toString());

    return true;
  }
  public transformByte(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const result = this.readByte(shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result);

    return true;
  }
  public transformFloat(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const result = this.readFloat(shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result);

    return true;
  }
  public assertNullByte(ctx: Context, shouldCount: boolean): boolean {
    const result = this.readByte(shouldCount);
    if (result === undefined) {
      return false;
    }
    if (result !== 0) {
      throw new Error(`Not zero, but ${result}`);
    }

    return true;
  }
  public transformHex(
    ctx: Context,
    ref: Reference,
    bytes: number,
    shouldCount: boolean
  ): boolean {
    const result = this.read(bytes, shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result.toString('hex'));

    return true;
  }
  public transformHexRemaining(
    ctx: Context,
    ref: Reference,
    lengthRef: Reference,
    shouldCount: boolean
  ): boolean {
    const length = getVar(ctx, lengthRef);

    const result = this.readUntil(length, shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result.toString('hex'));

    return true;
  }
  public startBuffer(
    ctx: Context,
    ref: Reference,
    resetBytesRead: boolean
  ): boolean {
    const result = this.readInt();
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result);
    if (resetBytesRead) {
      this.resetBytesRead();
    }

    return true;
  }
  public endBuffer(): boolean {
    return true;
  }
  public endSaveGame(): void {
    // nothing
  }
  public missingBytes = 0;
  private buffer: Buffer;
  private cursor = 0;
  private rollbackCursor = 0;
  private rollbackBytesRead = 0;

  // TODO pass bytesRead to the next Chunk
  private bytesRead = 0;
  constructor(
    buffer: Buffer,
    bytesRead: number,
    private progressCallback: (progress: number) => void
  ) {
    super();
    this.buffer = buffer;
    this.bytesRead = bytesRead;
  }

  public read(bytes: number, _shouldCount = true): Buffer | undefined {
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

  public transformInt(
    ctx: Context,
    ref: Reference,
    shouldCount = true,
    _defaultValue?: (ctx: Context) => number
  ): boolean {
    const result = this.readInt(shouldCount);
    if (result === undefined) {
      return false;
    }
    setVar(ctx, ref, result);

    return true;
  }

  private readInt(_shouldCount = true): number | undefined {
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

  public readStr(_shouldCount = true): string | undefined {
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
        throw new Error(
          `string(len: ${length}) does not end with zero, but with ${result}`
        );
      }
    }

    const result = this.readByte();
    if (result === undefined) {
      // rewind
      this.missingBytes += this.rollback();
      return undefined;
    }
    if (result !== 0) {
      throw new Error(
        `string(len: ${length}) does not end with zero, but with ${result}`
      );
    }
    return resultStr;
  }

  public readLong(_shouldCount = true): JSBI | undefined {
    const bytes = 8;

    if (this.cursor + bytes > this.buffer.length) {
      // Not enough bytes in this chunk
      this.missingBytes = this.cursor + bytes - this.buffer.length;
      return undefined;
    }

    const result = readBigInt64LE(this.buffer, this.cursor);
    // const result = new DataView(this.buffer, this.cursor, byte)

    this.cursor += bytes;
    this.bytesRead += bytes;
    return result;
  }

  public readByte(_shouldCount = true): number | undefined {
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

  public readFloat(_shouldCount = true): number | undefined {
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

  public readUntil(length: number, shouldCount: boolean): Buffer | undefined {
    //console.log('read', length, this.bytesRead);
    return this.read(length - this.bytesRead, shouldCount);
  }

  public setRollbackPoint(): void {
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

  public resetBytesRead(): void {
    this.bytesRead = 0;
  }

  public getBytesRead(): number {
    return this.bytesRead;
  }

  public emitProgress(progress: number): void {
    this.progressCallback(progress);
  }
}

// https://stackoverflow.com/a/14601808
function decodeUTF16LE(binaryStr: string): string {
  const cp = [];
  for (let i = 0; i < binaryStr.length; i += 2) {
    cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8));
  }
  // eslint-disable-next-line prefer-spread
  return String.fromCharCode.apply(String, cp);
}

const MAX_CHUNK_SIZE = 131072;

interface LengthPlaceholder {
  cursor: number;
  buffer: number;
  startBufferLength: number;
}

export class WriteArchive extends Archive {
  private buffers: Buffer[] = [];
  private buffer: Buffer;
  private cursor = 0;
  public bufferLength = 0;
  private totalBytes = 0;
  private lengthPlaceholders: LengthPlaceholder[] = [];

  constructor(private progressCallback: (progress: number) => void) {
    super();
    this.missingBytes = 1; // no real meaning except, we need to write out the chunk
    this.buffer = Buffer.alloc(MAX_CHUNK_SIZE);
  }

  public getFilledChunks(): Buffer[] {
    if (this.lengthPlaceholders.length === 0) {
      return this.buffers;
    } else {
      // If there are placeholders left in one of the filled chunks we need to hold it back until the placeholder is filled
      return [];
    }
  }
  public clearFilledChunks(): void {
    if (this.lengthPlaceholders.length === 0) {
      this.buffers = [];
    }
  }

  // returns only the filled portion of the first chunk
  public getHeaderChunk(): Buffer {
    // TODO only works if the whole header fits into the first chunk
    const header = this.buffer.slice(0, this.cursor);
    this.cursor = 0;
    this.buffer = Buffer.alloc(MAX_CHUNK_SIZE);
    return header;
  }

  public transformInt(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean,
    defaultValue?: (ctx: Context) => number
  ): boolean {
    let value = getVar(ctx, ref);
    if (defaultValue !== undefined) {
      value = defaultValue(ctx);
      setVar(ctx, ref, value);
    }
    if (value === undefined) {
      throw new Error(`Undefined integer ${ref.name}`);
    }
    return this.writeInt(value, shouldCount);
  }

  public writeInt(value: number, shouldCount: boolean): boolean {
    const bytes = 4;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;
    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      const buffer = Buffer.alloc(bytes);
      buffer.writeInt32LE(value, 0);
      this.putInNewChunk(buffer, bytes);
      return false;
    }
    this.buffer.writeInt32LE(value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  public transformStr(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const value = getVar(ctx, ref);
    if (value === undefined) {
      throw new Error(`Undefined string ${ref.name}`);
    }
    if (value.length === 0) {
      return this.writeInt(0, shouldCount);
    }

    let sameChunk = true;

    if (isASCII(value)) {
      sameChunk = this.writeInt(value.length + 1, shouldCount) && sameChunk;
      sameChunk = this.write(value, shouldCount) && sameChunk;
      sameChunk = this.writeByte(0, shouldCount) && sameChunk;
    } else {
      sameChunk = this.writeInt(-value.length - 1, shouldCount) && sameChunk;
      sameChunk =
        this.writeBuffer(encodeUTF16LE(value), shouldCount) && sameChunk;
      sameChunk = this.writeByte(0, shouldCount) && sameChunk;
      sameChunk = this.writeByte(0, shouldCount) && sameChunk;
    }

    return sameChunk;
  }

  public transformByte(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const value = getVar(ctx, ref);
    if (value === undefined) {
      throw new Error(`Undefined byte ${ref.name}`);
    }
    return this.writeByte(value, shouldCount);
  }

  private writeByte(value: number, shouldCount: boolean): boolean {
    const bytes = 1;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;

    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      this.buffers.push(this.buffer);
      this.buffer = Buffer.alloc(MAX_CHUNK_SIZE);
      this.buffer.writeUInt8(value, 0);
      this.cursor = 1;
      return false;
    }
    this.buffer.writeUInt8(value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  public transformLong(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    let value = getVar(ctx, ref);
    if (value === undefined) {
      throw new Error(`Undefined long ${ref.name}`);
    }
    // TODO remove when this is no longer stored as a string in json
    value = JSBI.BigInt(value);

    const bytes = 8;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;

    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      const buffer = Buffer.alloc(bytes);
      writeBigInt64LE(buffer, value, 0);
      this.putInNewChunk(buffer, bytes);
      return false;
    }
    writeBigInt64LE(this.buffer, value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  public transformFloat(
    ctx: Context,
    ref: Reference,
    shouldCount: boolean
  ): boolean {
    const value = getVar(ctx, ref);
    if (value === undefined) {
      throw new Error(`Undefined float ${ref.name}`);
    }
    const bytes = 4;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;

    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      const buffer = Buffer.alloc(bytes);
      buffer.writeFloatLE(value, 0);
      this.putInNewChunk(buffer, bytes);
      return false;
    }
    this.buffer.writeFloatLE(value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  private write(value: string, shouldCount: boolean): boolean {
    const bytes = value.length;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;

    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      const buffer = Buffer.alloc(bytes);
      buffer.write(value, 0);
      this.putInNewChunk(buffer, bytes);
      return false;
    }
    this.buffer.write(value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  private writeBuffer(value: Buffer, shouldCount: boolean): boolean {
    const bytes = value.length;

    if (shouldCount) {
      this.bufferLength += bytes;
    }
    this.totalBytes += bytes;

    if (this.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      this.putInNewChunk(value, bytes);
      return false;
    }
    this.buffer.set(value, this.cursor);
    this.cursor += bytes;
    return true;
  }

  public assertNullByte(ctx: Context, shouldCount: boolean): boolean {
    return this.writeByte(0, shouldCount);
  }
  public transformHex(
    ctx: Context,
    ref: Reference,
    bytes: number,
    shouldCount: boolean
  ): boolean {
    const value = getVar(ctx, ref);
    if (value === undefined) {
      throw new Error(`Undefined hex ${ref.name}`);
    }
    return this.writeBuffer(Buffer.from(value, 'hex'), shouldCount); // TODO somehow directly write the buffer?
  }
  public transformHexRemaining(
    ctx: Context,
    ref: Reference,
    lengthRef: Reference,
    shouldCount: boolean
  ): boolean {
    return this.transformHex(ctx, ref, 0, shouldCount);
  }
  public startBuffer(
    _ctx: Context,
    _ref: Reference,
    _resetBytesRead: boolean
  ): boolean {
    this.lengthPlaceholders.push({
      buffer: this.buffers.length,
      cursor: this.cursor,
      startBufferLength: this.bufferLength + 4, // +4 because this length counts for the encompassing counter
    });

    return this.writeInt(4919, true); // 0x1337 as placeholder
  }
  public endBuffer(_ctx: Context): boolean {
    // write the int to the previously allocated placeholder
    const lengthPlaceholder = this.lengthPlaceholders.pop();
    if (lengthPlaceholder === undefined) {
      throw new Error(
        'No length placeholder left over. endBuffer() was called more often than startBuffer() ?'
      );
    }
    const value = this.bufferLength - lengthPlaceholder.startBufferLength;

    // fix the buffer length for enclosing counters
    // they also count the bytes that were not included in our calculation
    let actualLengthInBytes = 0;
    let currentCursor = lengthPlaceholder.cursor;
    for (let i = lengthPlaceholder.buffer; i < this.buffers.length; i++) {
      actualLengthInBytes += this.buffers[i].length - currentCursor;
      currentCursor = 0;
    }
    actualLengthInBytes += this.cursor - currentCursor - 4;

    this.bufferLength =
      lengthPlaceholder.startBufferLength + actualLengthInBytes;

    let buffer =
      lengthPlaceholder.buffer < this.buffers.length
        ? this.buffers[lengthPlaceholder.buffer]
        : this.buffer;
    const bytes = 4;
    if (lengthPlaceholder.cursor + bytes > MAX_CHUNK_SIZE) {
      // not enough place in the buffer
      const smallBuffer = Buffer.alloc(bytes);
      smallBuffer.writeInt32LE(value, 0);

      const freePlace = MAX_CHUNK_SIZE - lengthPlaceholder.cursor;
      if (freePlace > 0) {
        buffer.set(smallBuffer.slice(0, freePlace), lengthPlaceholder.cursor);
      }

      lengthPlaceholder.buffer++;
      lengthPlaceholder.cursor = 0;
      buffer =
        lengthPlaceholder.buffer < this.buffers.length
          ? this.buffers[lengthPlaceholder.buffer]
          : this.buffer;
      const rest = freePlace > 0 ? smallBuffer.slice(freePlace) : smallBuffer;
      buffer.set(rest, lengthPlaceholder.cursor);
      // TODO return false only if there is a chunk finished that can be written out because lengthPlaceholders is empty
      return false;
    }
    buffer.writeInt32LE(value, lengthPlaceholder.cursor);

    // TODO return false if there is a chunk finished that can be written out because lengthPlaceholders is empty
    return true;
  }

  // correctly puts the values in the chunks
  private putInNewChunk(buffer: Buffer, bytes: number): void {
    const freePlace = MAX_CHUNK_SIZE - this.cursor;
    if (freePlace > 0) {
      this.buffer.set(buffer.slice(0, freePlace), this.cursor);
    }
    this.buffers.push(this.buffer);
    this.buffer = Buffer.alloc(MAX_CHUNK_SIZE);
    this.cursor = 0;
    const rest = freePlace > 0 ? buffer.slice(freePlace) : buffer;
    this.buffer.set(rest, this.cursor); // TODO check that this actually fits into the next chunk
    this.cursor += bytes - freePlace;
  }

  public endSaveGame(): void {
    // mark the last not completely filled chunk as finished
    this.buffers.push(this.buffer.slice(0, this.cursor));
    this.buffer = Buffer.alloc(0);
  }

  public emitProgress(progress: number): void {
    this.progressCallback(progress);
  }
}

// https://stackoverflow.com/a/14313213
function isASCII(str: string): boolean {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7F]*$/.test(str);
}
// https://stackoverflow.com/a/24391376
function encodeUTF16LE(text: string): Buffer {
  const byteArray = new Uint8Array(text.length * 2);
  for (let i = 0; i < text.length; i++) {
    byteArray[i * 2] = text.charCodeAt(i) & 0xff;
    byteArray[i * 2 + 1] = (text.charCodeAt(i) >> 8) & 0xff;
  }
  return Buffer.from(byteArray);
}
