import { Builder } from '../../../engine/Builder';

export function transformQuat(builder: Builder) {
  builder
    //.obj('value') TODO readd?
    .float('x')
    .float('y')
    .float('z')
    .float('w')
  //.endObj();
}