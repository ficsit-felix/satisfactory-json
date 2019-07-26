import { Archive } from '../../Archive';
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
    ar: Archive, property: Property) {
    ar.transformAssertNullByte(false); // Tag.HasPropertyGuid
    if (ar.isLoading()) {
        property.value = {};
    }
    transformFText(ar, property.value);
}

function transformFText(ar: Archive, value: any) {
    ar.transformInt(value, 'flags'); // Value.Flags

    ar.transformByte(value, 'historyType'); // HistoryType

    // parse the TextHistory according to TextHistory.cpp
    switch (value.historyType) {
        case HISTORYTYPE_BASE:
            ar.transformString(value, 'namespace');
            ar.transformString(value, 'key');
            ar.transformString(value, 'sourceString');
            break;

        case HISTORYTYPE_NONE:
            // this is the end of the  no value ?
            break;
        case HISTORYTYPE_ARGUMENTFORMAT:
            if (ar.isLoading()) {
                value.sourceFmt = {};
            }
            transformFText(ar, value.sourceFmt);

            // Arguments
            if (ar.isLoading()) {
                value.arguments = [];
            }
            const argumentCount = { count: value.arguments.length };
            ar.transformInt(argumentCount, 'count');

            for (let i = 0; i < argumentCount.count; i++) {
                if (ar.isLoading()) {
                    value.arguments[i] = {};
                }

                ar.transformString(value.arguments[i], 'argumentName');
                ar.transformByte(value.arguments[i], 'argumentValueType');
                switch (value.arguments[i].argumentValueType) {
                    case FORMATARGUMENTTYPE_TEXT:
                        if (ar.isLoading()) {
                            value.arguments[i].argumentValue = {};
                        }
                        transformFText(ar, value.arguments[i].argumentValue);
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
