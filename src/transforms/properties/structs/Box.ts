import { Builder } from '../../../engine/Builder';

export function transformBox(builder: Builder) {
  builder
    //.obj('value') TODO readd: were missing
    .obj('min') // TODO arr
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .obj('max') // TODO arr
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .byte('isValid')
  //.endObj();
}