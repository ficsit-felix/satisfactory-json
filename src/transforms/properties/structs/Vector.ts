import { Builder } from '../../../engine/Builder';

export function transformVector(builder: Builder): void {
  builder
    // TODO Readd: were missing?
    //  .obj('value')
    .float('x')
    .float('y')
    .float('z');
  //    .endObj();
}
