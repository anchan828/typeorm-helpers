import { Column, ColumnOptions, ValueTransformer } from "typeorm";
import { monotonicFactory, ulid } from "ulid";
const monotonic = monotonicFactory();

export interface UlidColumnOptions {
  // defaul: true
  isMonotonic: boolean;
}
class UlidTransformer implements ValueTransformer {
  constructor(private readonly options: UlidColumnOptions) {}
  public from(value: string): string {
    return value;
  }
  public to(value: string | undefined): string {
    if (value) {
      return value;
    }

    return this.options.isMonotonic ? monotonic() : ulid();
  }
}
export function UlidColumn(trasformerOptions?: UlidColumnOptions, options?: ColumnOptions) {
  const columnTrasformerOptions = {
    isMonotonic: true,
    ...trasformerOptions,
  };

  const columnOptions = {
    length: "26",
    type: "varchar",
    ...options,
  } as ColumnOptions;

  columnOptions.transformer = new UlidTransformer(columnTrasformerOptions);
  return Column(columnOptions);
}

export function PrimaryUlidColumn(trasformerOptions?: UlidColumnOptions, options?: ColumnOptions) {
  const columnOptions = {
    primary: true,
    ...options,
  } as ColumnOptions;

  return UlidColumn(trasformerOptions, columnOptions);
}
