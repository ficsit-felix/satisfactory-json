import { Builder } from '../../../engine/Builder';

export function transformVector(builder: Builder) {
  builder
    .float('x')
    .float('y')
    .float('z');
}