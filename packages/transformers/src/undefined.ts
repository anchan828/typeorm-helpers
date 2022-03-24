import { ValueTransformer } from "typeorm";
import { isNullOrUndefined } from "./utils";

/**
 * Transform converts null to undefined.
 */
export class UndefinedTransformer implements ValueTransformer {
  public from(value?: any | null): any | undefined {
    if (isNullOrUndefined(value)) {
      return undefined;
    }
    return value;
  }

  public to(value?: any | null): any | undefined {
    return value;
  }
}
