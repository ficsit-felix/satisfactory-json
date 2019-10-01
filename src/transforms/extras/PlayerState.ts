import { Builder } from '../../engine/Builder';

export function transformPlayerState(builder: Builder): void {
  builder
    .obj('extra')
    //.debugger()
    .hexRemaining('unknown', '_entityLength')
    .endObj();
}
