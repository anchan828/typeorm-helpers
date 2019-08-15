import { StaticFileTransformer, StaticFileTransformerOptions } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";

export function StaticFileColumn(trasformerOptions: StaticFileTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      type: "varchar",
      width: 255,
    } as ColumnOptions,
    options || {},
  );
  columnOptions.transformer = new StaticFileTransformer(trasformerOptions);
  return Column(columnOptions);
}
