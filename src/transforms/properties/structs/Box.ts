import { Builder } from '../../../engine/Builder';

export function transformBox(builder: Builder) {
  builder
    .obj('value')
    .arr('min')
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .arr('max')
    .float(0)
    .float(1)
    .float(2)
    .endArr()
    .byte('isValid')
    .endObj();
}