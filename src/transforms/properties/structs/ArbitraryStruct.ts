import { Builder } from '../../../engine/Builder';
import { transformProperties } from '../../Entity';

export function transformArbitraryStruct(builder: Builder): void {
  builder.call(transformProperties);
}
