import { Builder } from '../../engine/Builder';

export function transformPlayerState(builder: Builder) {
  builder
    .hexRemaining('unknown', '_entityLength')
}