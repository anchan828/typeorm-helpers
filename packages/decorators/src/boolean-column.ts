import { BooleanTransformer } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";
export function BooleanColumn(options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      type: "tinyint",
      width: 1,
    } as ColumnOptions,
    options || {},
  );
  columnOptions.transformer = new BooleanTransformer();

  if (columnOptions.default !== undefined) {
    columnOptions.default = columnOptions.default ? 1 : 0;
  }

  return Column(columnOptions);
}
