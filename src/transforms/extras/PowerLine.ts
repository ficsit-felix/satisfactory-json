import { Builder } from '../../engine/Builder';

export function transformPowerLine(builder: Builder) {
  builder
    .obj('extra')
    .str('sourceLevelName')
    .str('sourcePathName')
    .str('targetLevelName')
    .str('targetPathName')
    .endObj();
}