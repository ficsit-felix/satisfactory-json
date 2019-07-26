import { DataBuffer } from '../../DataBuffer';
import { Property } from '../../types';

// ETextHistoryType
const HISTORYTYPE_BASE = 0;
const HISTORYTYPE_NAMEDFORMAT = 1;
const HISTORYTYPE_ORDEREDFORMAT = 2;
const HISTORYTYPE_ARGUMENTFORMAT = 3;
const HISTORYTYPE_ASNUMBER = 4;
const HISTORYTYPE_ASPERCENT = 5;
const HISTORYTYPE_ASCURRENCY = 6;
const HISTORYTYPE_ASDATE = 7;
const HISTORYTYPE_ASTIME = 8;
const HISTORYTYPE_ASDATETIME = 9;
const HISTORYTYPE_TRANSFORM = 10;
const HISTORYTYPE_STRINGTABLEENTRY = 11;
const HISTORYTYPE_NONE = 255; // -1

// EFormatArgumentType
const FORMATARGUMENTTYPE_INT = 0;
const FORMATARGUMENTTYPE_UINT = 1;
const FORMATARGUMENTTYPE_FLOAT = 2;
const FORMATARGUMENTTYPE_DOUBLE = 3;
const FORMATARGUMENTTYPE_TEXT = 4;
const FORMATARGUMENTTYPE_GENDER = 5;

export default function transformTextProperty(
    buffer: DataBuffer, property: Property, toSav: boolean) {
    buffer.transformAssertNullByte(toSav, false); // Tag.HasPropertyGuid
    if (!toSav) {
        property.value = {};
    }
    transformFText(buffer, property.value, toSav);
}

function transformFText(buffer: DataBuffer, value: any, toSav: boolean) {
    buffer.transformInt(value, 'flags', toSav); // Value.Flags

    buffer.transformByte(value, 'historyType', toSav); // HistoryType

    // parse the TextHistory according to TextHistory.cpp
    switch (value.historyType) {
        case HISTORYTYPE_BASE:
            buffer.transformString(value, 'namespace', toSav);
            buffer.transformString(value, 'key', toSav);
            buffer.transformString(value, 'sourceString', toSav);
            break;

        case HISTORYTYPE_NONE:
            // this is the end of the  no value ?
            break;
        case HISTORYTYPE_ARGUMENTFORMAT:
            if (!toSav) {
                value.sourceFmt = {};
            }
            transformFText(buffer, value.sourceFmt, toSav);

            // Arguments
            if (!toSav) {
                value.arguments = [];
            }
            const argumentCount = {count: value.arguments.length};
            buffer.transformInt(argumentCount, 'count', toSav);

            for (let i = 0; i < argumentCount.count; i++) {
                if (!toSav) {
                    value.arguments[i] = {};
                }

                buffer.transformString(value.arguments[i], 'argumentName', toSav);
                buffer.transformByte(value.arguments[i], 'argumentValueType', toSav);
                switch (value.arguments[i].argumentValueType) {
                    case FORMATARGUMENTTYPE_TEXT:
                        if (!toSav) {
                            value.arguments[i].argumentValue = {};
                        }
                        transformFText(buffer, value.arguments[i].argumentValue, toSav);
                        break;
                    default:
                        throw new Error('Unhandled FormatArgumentType: ' +
                        value.arguments[i].argumentValueType);
                }

            }

            break;
        default:
            throw new Error('Unhandled HistoryType of TextProperty: ' + value.historyType);
    }
}
