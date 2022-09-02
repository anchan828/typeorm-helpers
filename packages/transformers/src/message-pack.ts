import { pack, unpack } from "msgpackr";
import { ValueTransformer } from "typeorm";
import { isNullOrUndefined } from "./utils";

/**
 * Transform value between object and messagepack.
 * Currently only mysql and postgres are supported.
 */
export class MessagePackTransformer<T> implements ValueTransformer {
  constructor(private readonly defaultValue?: T) {}

  public from(value?: Buffer | null): T | undefined {
    if (isNullOrUndefined(value)) {
      return this.defaultValue;
    }

    try {
      return unpack(value);
    } catch (e: any) {
      return this.defaultValue;
    }
  }

  public to(value?: T | null): Buffer | undefined | null {
    if (isNullOrUndefined(value)) {
      value = this.defaultValue;
    }

    if (isNullOrUndefined(value)) {
      return value;
    }

    return pack(value);
  }
}
