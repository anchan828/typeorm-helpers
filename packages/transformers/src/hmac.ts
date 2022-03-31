import { BinaryLike, createHmac } from "crypto";
import { ValueTransformer } from "typeorm";
import { isNullOrUndefined } from "./utils";
export interface HmacTransformerOptions {
  /**
   * The algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform.
   */
  algorithm?: string;

  /**
   * The key is the HMAC key used to generate the cryptographic HMAC hash. If it is undefined, use value argument.
   */
  key?: BinaryLike;
}
/**
 * Transform value to hashed value by crypto.createHmac
 */
export class HmacTransformer implements ValueTransformer {
  private transformerOptions: Pick<HmacTransformerOptions, "key"> & Required<Pick<HmacTransformerOptions, "algorithm">>;

  constructor(private options?: HmacTransformerOptions) {
    this.transformerOptions = { algorithm: "sha256", ...options };
  }
  public from(value?: string | null): string | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }

    return value;
  }

  public to(value?: string | null): string | undefined {
    if (isNullOrUndefined(value)) {
      return;
    }

    const { algorithm, key } = this.transformerOptions;
    return createHmac(algorithm, key ? key : value)
      .update(value)
      .digest("hex");
  }
}
