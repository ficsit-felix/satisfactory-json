import { Builder } from '../../../engine/Builder';

export function transformVector(builder: Builder) {
  builder
    // TODO Readd: were missing?
    //  .obj('value')
    .float('x')
    .float('y')
    .float('z')
  //    .endObj();
}