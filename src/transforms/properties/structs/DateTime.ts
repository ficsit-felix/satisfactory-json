import { Builder } from '../../../engine/Builder';

export function transformDateTime(builder: Builder): void {
  builder.long('dateTime');
}
