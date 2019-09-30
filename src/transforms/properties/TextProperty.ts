import { Builder } from '../../engine/Builder';

export function transformTextProperty(builder: Builder): void {
  builder
    .assertNullByte(false) // Tag.HasPropertyGuid
    .obj('value')
    .call(transformFText)
    .endObj();
}

/*
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
*/

function transformFText(builder: Builder): void {
  builder
    .int('flags') // Value.Flags
    .byte('historyType') // HistoryType

    // parse the TextHistory according to TextHistory.cpp
    .switch('historyType', {
      '0' /*HISTORYTYPE_BASE*/: builder => {
        builder
          .str('namespace')
          .str('key')
          .str('sourceString');
      },
      '255' /*HISTORYTYPE_NONE*/: _builder => {}, // this is the end of the  no value ?
      '3' /*HISTORYTYPE_ARGUMENTFORMAT*/: builder => {
        builder
          .obj('sourceFmt')
          .call(transformFText)
          .endObj()
          // Arguments
          .int('_argumentCount', ctx => ctx.obj.arguments.length)
          .arr('arguments')
          .loop('_argumentCount', builder => {
            builder
              .elem('_index')
              .str('argumentName')
              .byte('argumentValueType')
              .switch('argumentValueType', {
                '4' /*FORMATARGUMENTTYPE_TEXT*/: builder => {
                  builder
                    .obj('argumentValue')
                    .call(transformFText)
                    .endObj();
                },
                $default: builder => {
                  builder.error(
                    ctx =>
                      `Unhandled FormatArgumentType: ${ctx.obj.argumentValueType}`
                  );
                }
              })
              .endElem();
          })
          .endArr();
      },
      $default: builder => {
        builder.error(ctx => `Unhandled HistoryType: ${ctx.obj.historyType}`);
      }
    });
}
