import { Builder } from '../../../engine/Builder';

export function transformVector2D(builder: Builder): void {
  builder
    .float('x')
    .float('y');
}
