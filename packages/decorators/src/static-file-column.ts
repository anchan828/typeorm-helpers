import { StaticFileTransformer, StaticFileTransformerOptions } from "@anchan828/typeorm-transformers";
import { Column, ColumnOptions } from "typeorm";

export function StaticFileColumn(trasformerOptions: StaticFileTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = {
    type: "varchar",
    width: 255,
    ...options,
  } as ColumnOptions;
  columnOptions.transformer = new StaticFileTransformer(trasformerOptions);
  return Column(columnOptions);
}
