import { ValueTransformer } from 'typeorm';
import { isNullOrUndefined } from './utils';

/**
 * Transform value between integer and boolean.
 */
export class BooleanTransformer implements ValueTransformer {
  public from(value?: number | null): boolean | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }
    return value ? true : false;
  }

  public to(value?: boolean | null): number | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }
    return value ? 1 : 0;
  }
}
