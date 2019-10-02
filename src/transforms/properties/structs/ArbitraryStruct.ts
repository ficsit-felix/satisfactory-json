import { Builder } from '../../../engine/Builder';
import { RegisteredFunction } from '../../../engine/TransformationEngine';

export function transformArbitraryStruct(builder: Builder): void {
  builder.call(RegisteredFunction.transformProperties);
}
