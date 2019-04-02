import { ValueTransformer } from 'typeorm';
import { isNullOrUndefined } from './utils';

/**
 * Transform value between object and json.
 */
export class JsonTransformer<T> implements ValueTransformer {
  constructor(private readonly defaultValue?: T) {}

  public from(value?: string | null): T | undefined {
    if (isNullOrUndefined(value)) {
      return this.defaultValue;
    }

    try {
      return JSON.parse(value);
    } catch (e) {
      return this.defaultValue;
    }
  }

  public to(value?: T | null): string | undefined {
    if (isNullOrUndefined(value)) {
      value = this.defaultValue;
    }

    if (isNullOrUndefined(value)) {
      return;
    }

    return JSON.stringify(value);
  }
}
