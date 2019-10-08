import { JsonTransformer } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";
export function JsonColumn<T>(options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      type: "json",
    } as ColumnOptions,
    options || {},
  );
  const defaultValue = columnOptions.default;

  if (columnOptions.default) {
    columnOptions.default = undefined;
  }
  const jsonTransformer = new JsonTransformer<T>(defaultValue);
  columnOptions.transformer = {
    to: (value: any): any => {
      let result = jsonTransformer.to(value);

      if (typeof result === "string") {
        result = JSON.parse(result);
      }
      return result;
    },
    from: (value: any): any => {
      return jsonTransformer.from(value);
    },
  };

  return Column(columnOptions);
}
