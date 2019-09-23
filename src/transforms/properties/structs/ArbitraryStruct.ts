import { Builder } from '../../../engine/Builder';
import { transformProperties } from '../../Entity';

export function transformArbitraryStruct(builder: Builder) {
  builder.call(transformProperties);
}