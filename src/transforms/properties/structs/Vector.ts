import { Builder } from '../../../engine/Builder';

export function transformVector(builder: Builder) {
  builder
    .obj('value')
    .float('x')
    .float('y')
    .float('z')
    .endObj();
}