import { Builder } from '../../../engine/Builder';

export function transformQuat(builder: Builder) {
  builder
    .obj('value')
    .float('x')
    .float('y')
    .float('z')
    .float('w')
    .endObj();
}