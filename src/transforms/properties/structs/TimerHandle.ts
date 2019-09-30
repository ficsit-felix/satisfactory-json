import { Builder } from '../../../engine/Builder';

export function transformTimerHandle(builder: Builder): void {
  builder
    //.obj('value')
    .str('handle');
  //.endObj();
}
