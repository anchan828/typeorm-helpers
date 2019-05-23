import * as deepmerge from 'deepmerge';
import { Column, ColumnOptions, ValueTransformer } from 'typeorm';
import { monotonicFactory, ulid } from 'ulid';
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
export function UlidColumn(
  trasformerOptions?: UlidColumnOptions,
  options?: ColumnOptions,
) {
  trasformerOptions = deepmerge(
    {
      isMonotonic: true,
    },
    trasformerOptions || {},
  );

  options = deepmerge(
    {
      length: '26',

      type: 'varchar',
      unique: true,
    } as ColumnOptions,
    options || {},
  ) as ColumnOptions;
  options.transformer = new UlidTransformer(trasformerOptions);
  return Column(options);
}
