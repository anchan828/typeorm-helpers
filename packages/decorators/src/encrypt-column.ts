import { EncryptTransformer, EncryptTransformerOptions } from "@anchan828/typeorm-transformers";
import { Column, ColumnOptions } from "typeorm";
export function EncryptColumn(trasformerOptions: EncryptTransformerOptions, options?: ColumnOptions): Function {
  const columnOptions = {
    select: false,
    type: "text",
    ...options,
  } as ColumnOptions;
  columnOptions.transformer = new EncryptTransformer(trasformerOptions);
  return Column(columnOptions);
}
