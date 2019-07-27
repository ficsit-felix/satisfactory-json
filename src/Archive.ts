
type Key = string | number;

interface OutputBufferBuffer {
    bytes: string;
    length: number;
}
export interface Archive {
    isSaving(): boolean;
    isLoading(): boolean;

    //#region Functions that will be removed by the preprocessor
    transformInt(obj: number, count?: boolean): void;
    transformString(obj: string, count?: boolean): void;
    transformFloat(obj: number): void;
    transformLong(obj: string): void;
    transformByte(obj: number, count?: boolean): void;
    transformHex(obj: string, count: number, shouldCount?: boolean): void;
    //#endregion

    //#region Actual functions that the functions above will be replaced with
    _Int(obj: any, key: string | number, count?: boolean): void;
    _String(obj: any, key: string | number, count?: boolean): void;
    _Float(obj: any, key: string | number): void;
    _Long(obj: any, key: string | number): void;
    _Byte(obj: any, key: Key, count?: boolean): void;
    _Hex(obj: any, key: Key, count: number, shouldCount?: boolean): void;
    //#endregion

    transformBufferStart(resetBytesRead: boolean): number;
    transformBufferEnd(): void;
    transformAssertNullByte(count?: boolean): void;
    transformAssertNullInt(count?: boolean): void;

}

/**
 * Base class that implements all the functions that will be removed by the preprocessor
 */
abstract class BaseArchive implements Archive {

    public abstract isSaving(): boolean;
    public abstract isLoading(): boolean;
    public abstract _Int(obj: any, key: string | number, count?: boolean): void;
    public abstract _String(obj: any, key: string | number, count?: boolean): void;
    public abstract _Float(obj: any, key: string | number): void;
    public abstract _Long(obj: any, key: string | number): void;
    public abstract _Byte(obj: any, key: string | number, count?: boolean): void;
    public abstract transformBufferStart(resetBytesRead: boolean): number;
    public abstract transformBufferEnd(): void;
    public abstract transformAssertNullByte(count?: boolean): void;
    public abstract transformAssertNullInt(count?: boolean): void;
    public abstract _Hex(
        obj: any, key: string | number, count: number, shouldCount?: boolean): void;

    public transformInt(obj: number, count?: boolean): void {
        throw new Error('transformInt should be removed by preprocessor.');
    }

    public transformString(obj: string, count?: boolean): void {
        throw new Error('transformString should be removed by preprocessor.');
    }
    public transformFloat(obj: number): void {
        throw new Error('transformFloat should be removed by preprocessor.');
    }
    public transformLong(obj: string): void {
        throw new Error('transformLong should be removed by preprocessor.');
    }
    public transformByte(obj: number, count?: boolean): void {
        throw new Error('transformByte should be removed by preprocessor.');
    }
    public transformHex(obj: string, count: number, shouldCount?: boolean): void {
        throw new Error('transformHex should be removed by preprocessor.');
    }
}

export class LoadingArchive extends BaseArchive {
    public buffer: Buffer; // TODO make private
    //#region read buffer
    public cursor: number;
    public bytesRead: number;
    //#endregion

    constructor(buffer: Buffer) {
        super();
        this.buffer = buffer;
        this.cursor = 0;
        this.bytesRead = 0;
    }

    public isSaving(): boolean {
        return false;
    }

    public isLoading(): boolean {
        return true;
    }

    public _Int(obj: any, key: string | number, count: boolean = true): void {
        obj[key] = this.readInt();
    }

    public _String(obj: any, key: string | number, count: boolean = true): void {
        obj[key] = this.readLengthPrefixedString();
    }

    public _Float(obj: any, key: string | number): void {
        obj[key] = this.readFloat();
    }

    public _Long(obj: any, key: string | number): void {
        obj[key] = this.readLong();
    }

    public _Byte(obj: any, key: Key, count: boolean = true): void {
        obj[key] = this.readByte();
    }

    public transformBufferStart(resetBytesRead: boolean): number {
        const length = this.readInt();
        if (resetBytesRead) {
            // is currently only true for the Entity as we don't add
            // missing sections anywhere else
            this.resetBytesRead();
        }
        return length;
    }

    public transformBufferEnd(): void {
        // TODO write missing?
    }

    public transformAssertNullByte(count: boolean = true): void {
        this.assertNullByte();
    }

    public transformAssertNullInt(count: boolean = true): void {
        this.assertNullInt();
    }

    public _Hex(obj: any, key: Key, count: number, shouldCount: boolean = true): void {
        obj[key] = this.readHex(count);
    }

    //#region should be private
    public readInt(): number {
        const result = this.buffer.readInt32LE(this.cursor);
        this.cursor += 4;
        this.bytesRead += 4;
        return result;
    }
    public readLong(): string {
        /*let result = this.buffer.readInt32LE(this.cursor);
              // TODO figure out how to actually deal with longs in JS!
              this.cursor += 8;
              this.bytesRead += 8;
              return result;*/
        return this.readHex(8);
    }
    public readByte(): number {
        const result = this.buffer.readUInt8(this.cursor);
        this.cursor += 1;
        this.bytesRead += 1;
        return result;
    }
    public readFloat(): number {
        const result = this.buffer.readFloatLE(this.cursor);
        this.cursor += 4;
        this.bytesRead += 4;
        return result;
    }
    public readHex(count: number): string {
        const result = this.buffer
            .slice(this.cursor, this.cursor + count)
            .toString('hex');
        this.cursor += count;
        this.bytesRead += count;
        return result;
    }
    // https://stackoverflow.com/a/14601808
    public decodeUTF16LE(binaryStr: string): string {
        const cp = [];
        for (let i = 0; i < binaryStr.length; i += 2) {
            cp.push(binaryStr.charCodeAt(i) | (binaryStr.charCodeAt(i + 1) << 8));
        }
        return String.fromCharCode.apply(String, cp);
    }
    public readLengthPrefixedString(): string {
        let length = this.readInt();
        if (length === 0) {
            return '';
        }
        let utf16 = false;
        if (length < 0) {
            // Thanks to @Goz3rr we know that this is now an utf16 based string
            // throw new Error('length of string < 0: ' + length);
            length = -2 * length;
            utf16 = true;
        }
        if (this.cursor + length > this.buffer.length) {
            console.log(this.readHex(32));
            // tslint:disable-next-line: no-console
            console.trace('buffer < ' + length);
            throw new Error('cannot read string of length: ' + length);
        }
        let resultStr;
        if (utf16) {
            const result = this.buffer.slice(this.cursor, this.cursor + length - 2);
            resultStr = this.decodeUTF16LE(result.toString('binary'));
            this.cursor += length - 2;
            this.bytesRead += length - 2;
        } else {
            const result = this.buffer.slice(this.cursor, this.cursor + length - 1);
            resultStr = result.toString('utf8');
            this.cursor += length - 1;
            this.bytesRead += length - 1;
        }
        if (this.cursor < 0) {
            throw new Error('Cursor overflowed to ' + this.cursor + ' by ' + length);
        }
        if (utf16) {
            this.assertNullByteString(length, resultStr); // two null bytes for utf16
        }
        this.assertNullByteString(length, resultStr);
        return resultStr;
    }
    public assertNullByteString(length: number, result: string) {
        const zero = this.buffer.readInt8(this.cursor);
        if (zero !== 0) {
            throw new Error('string (length: ' + length +
                ') does not end with zero, but with ' + zero + ': ' + result);
        }
        this.cursor += 1;
        this.bytesRead += 1;
    }
    public assertNullByte() {
        const zero = this.buffer.readInt8(this.cursor);
        if (zero !== 0) {
            throw new Error('expected 0 byte, but got ' + zero);
        }
        this.cursor += 1;
        this.bytesRead += 1;
    }
    public assertNullInt() {
        const zero = this.readInt();
        if (zero !== 0) {
            console.log(this.readHex(32));
            throw new Error('expected 0 int, but got ' + zero);
        }
    }
    public resetBytesRead() {
        this.bytesRead = 0;
    }
    //#endregion
}

/**
 * Archive that handles serializing the data when transforming json2sav.
 *
 * TODO: make more efficient by not using a bunch of string concatenations?
 * Maybe have a way to seek back to the position where the length of the next position is stored as
 * in the C++ code and then replace it there?
 */
export class SavingArchive extends BaseArchive {
    public buffer: Buffer; // TODO make private

    //#region write buffer
    public buffers: OutputBufferBuffer[] = []; // TODO make private
    private bytes: string = '';
    //#endregion

    constructor(buffer: Buffer) {
        super();
        this.buffer = buffer;
    }

    public isSaving(): boolean {
        return true;
    }

    public isLoading(): boolean {
        return false;
    }

    /**
     * Returns the final output after the transform is finished.
     */
    public getOutput(): string {
        return this.bytes;
    }

    public _Int(obj: any, key: string | number, count: boolean = true): void {
        this.writeInt(obj[key], count);
    }

    public _String(obj: any, key: string | number, count: boolean = true): void {
        this.writeLengthPrefixedString(obj[key], count);
    }

    public _Float(obj: any, key: string | number): void {
        this.writeFloat(obj[key]);
    }

    public _Long(obj: any, key: string | number): void {
        this.writeLong(obj[key]);
    }

    public _Byte(obj: any, key: Key, count: boolean = true): void {
        this.writeByte(obj[key], count);
    }

    public transformBufferStart(resetBytesRead: boolean): number {
        this.addBuffer();
        return 0;
    }

    public transformBufferEnd(): void {
        this.endBufferAndWriteSize();
    }

    public transformAssertNullByte(count: boolean = true): void {
        this.writeByte(0, count);
    }

    public transformAssertNullInt(count: boolean = true): void {
        this.writeInt(0, count);
    }

    public _Hex(obj: any, key: Key, count: number, shouldCount: boolean = true): void {
        this.writeHex(obj[key], shouldCount);
    }

    //#region should be private
    public write(bytes: string, count = true) {
        if (this.buffers.length === 0) {
            this.bytes += bytes;
        } else {
            this.buffers[this.buffers.length - 1].bytes += bytes;
            if (count) {
                this.buffers[this.buffers.length - 1].length += bytes.length;
            }
        }
    }
    public addBuffer() {
        this.buffers.push({ bytes: '', length: 0 });
    }
    public endBufferAndWriteSize() {
        const buffer = this.buffers[this.buffers.length - 1];
        this.buffers.pop(); // remove last element
        this.writeInt(buffer.length);
        this.write(buffer.bytes); // TODO check if correct
        return buffer.length;
    }
    public writeInt(value: number, count = true) {
        const buffer = Buffer.alloc(4);
        buffer.writeInt32LE(value, 0);
        this.write(buffer.toString('binary'), count);
    }
    public writeLong(value: string) {
        this.writeHex(value);
    }
    public writeByte(value: number, count = true) {
        this.write(String.fromCharCode(value), count);
    }
    public writeFloat(value: number) {
        const buffer = Buffer.alloc(4);
        buffer.writeFloatLE(value, 0);
        this.write(buffer.toString('binary'));
    }
    public writeHex(value: string, count = true) {
        const buffer = Buffer.from(value, 'hex');
        this.write(buffer.toString('binary'), count);
    }
    // https://stackoverflow.com/a/14313213
    public isASCII(str: string): boolean {
        return /^[\x00-\x7F]*$/.test(str);
    }
    // https://stackoverflow.com/a/24391376
    public encodeUTF16LE(text: string) {
        const byteArray = new Uint8Array(text.length * 2);
        for (let i = 0; i < text.length; i++) {
            byteArray[i * 2] = text.charCodeAt(i) & 0xff;
            byteArray[i * 2 + 1] = (text.charCodeAt(i) >> 8) & 0xff;
        }
        return String.fromCharCode.apply(String, byteArray as any);
    }
    public writeLengthPrefixedString(value: string, count = true) {
        if (value.length === 0) {
            this.writeInt(0, count);
        } else {
            if (this.isASCII(value)) {
                this.writeInt(value.length + 1, count);
                this.write(value, count);
                this.writeByte(0, count);
            } else {
                this.writeInt(-value.length - 1, count);
                this.write(this.encodeUTF16LE(value));
                this.writeByte(0, count);
                this.writeByte(0, count);
            }
        }
    }
    //#endregion
}
