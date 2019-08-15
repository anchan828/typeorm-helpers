import { HmacTransformer, HmacTransformerOptions } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";
export function HmacColumn(trasformerOptions?: HmacTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      select: false,
      type: "varchar",
    } as ColumnOptions,
    options || {},
  );
  columnOptions.transformer = new HmacTransformer(trasformerOptions);
  return Column(columnOptions);
}
