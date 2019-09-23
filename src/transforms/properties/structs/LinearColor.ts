import { Builder } from '../../../engine/Builder';

export function transformLinearColor(builder: Builder) {
  builder
    .obj('value')
    .float('r')
    .float('g')
    .float('b')
    .float('a')
    .endObj();
}