import { EncryptTransformer, EncryptTransformerOptions } from "@anchan828/typeorm-transformers";
import * as deepmerge from "deepmerge";
import { Column, ColumnOptions } from "typeorm";
export function EncryptColumn(trasformerOptions: EncryptTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = deepmerge(
    {
      select: false,
      type: "text",
    } as ColumnOptions,
    options || {},
  );
  columnOptions.transformer = new EncryptTransformer(trasformerOptions);
  return Column(columnOptions);
}
