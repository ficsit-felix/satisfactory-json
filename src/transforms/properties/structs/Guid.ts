import { Builder } from '../../../engine/Builder';

export function transformGuid(builder: Builder) {
  builder
    //.obj('value')
    .hex('value', 16)
  //.endObj();
}