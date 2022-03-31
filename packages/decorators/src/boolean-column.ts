import { BooleanTransformer } from "@anchan828/typeorm-transformers";
import { Column, ColumnOptions } from "typeorm";
export function BooleanColumn(options?: ColumnOptions): Function {
  const columnOptions = {
    type: "tinyint",
    width: 1,
    ...options,
  } as ColumnOptions;
  columnOptions.transformer = new BooleanTransformer();

  if (columnOptions.default !== undefined) {
    columnOptions.default = columnOptions.default ? 1 : 0;
  }

  return Column(columnOptions);
}
