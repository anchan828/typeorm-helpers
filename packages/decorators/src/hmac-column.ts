import { HmacTransformer, HmacTransformerOptions } from "@anchan828/typeorm-transformers";
import { Column, ColumnOptions } from "typeorm";
export function HmacColumn(trasformerOptions?: HmacTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = {
    select: false,
    type: "varchar",
    ...options,
  } as ColumnOptions;
  columnOptions.transformer = new HmacTransformer(trasformerOptions);
  return Column(columnOptions);
}
