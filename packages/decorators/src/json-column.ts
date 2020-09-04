import { JsonTransformer } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";
export function JsonColumn<T>(options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      type: "text",
    } as ColumnOptions,
    options || {},
  );
  const defaultValue = columnOptions.default;

  if (columnOptions.default) {
    columnOptions.default = undefined;
  }

  columnOptions.transformer = new JsonTransformer<T>(defaultValue);

  return Column(columnOptions);
}
