import { JsonTransformer } from "@anchan828/typeorm-transformers";
import { Column, ColumnOptions } from "typeorm";
export function JsonColumn<T>(options?: ColumnOptions): Function {
  const columnOptions = {
    type: "text",
    ...options,
  } as ColumnOptions;
  const defaultValue = columnOptions.default;

  if (columnOptions.default) {
    columnOptions.default = undefined;
  }

  columnOptions.transformer = new JsonTransformer<T>(defaultValue);

  return Column(columnOptions);
}
