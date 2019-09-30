import { Builder } from '../../engine/Builder';

export function transformTrain(builder: Builder): void {
  builder
    .obj('extra')
    .assertNullByte() // TODO assertnullint
    .assertNullByte()
    .assertNullByte()
    .assertNullByte()
    .str('previousLevelName')
    .str('previousPathName')
    .str('nextLevelName')
    .str('nextPathName')
    .endObj();
}
