import { Column, ColumnOptions, ValueTransformer } from "typeorm";
import { monotonicFactory, PRNG, ulid, ULIDFactory } from "ulidx";

export interface UlidColumnOptions {
  isMonotonic?: boolean;
  prng?: PRNG | undefined;
  seedTime?: number | undefined;
}
class UlidTransformer implements ValueTransformer {
  private readonly monotonic: ULIDFactory | undefined;
  constructor(private readonly options: UlidColumnOptions) {
    if (options.isMonotonic) {
      this.monotonic = monotonicFactory(options.prng);
    }
  }
  public from(value: string): string {
    return value;
  }
  public to(value: string | undefined): string {
    if (value) {
      return value;
    }

    return this.options.isMonotonic && this.monotonic
      ? this.monotonic(this.options.seedTime)
      : ulid(this.options.seedTime);
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
