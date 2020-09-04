import { ValueTransformer } from "typeorm";
import { isNullOrUndefined } from "./utils";

/**
 * parse json string to javascript object.
 * JSON.parse has receiver for Date.parse.
 */
export const parseJSON = <T>(json: string): T | undefined => {
  return JSON.parse(json, (_: string, value: any): any => {
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      const date = Date.parse(value);
      if (!isNaN(date)) {
        return new Date(date);
      }
    }
    return value;
  });
};

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
      return parseJSON(value);
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
