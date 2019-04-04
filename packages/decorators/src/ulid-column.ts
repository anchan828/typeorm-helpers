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
  trasformerOptions = Object.assign(
    {
      isMonotonic: true,
    },
    trasformerOptions || {},
  );

  options = Object.assign(
    {
      length: '26',
      transformer: new UlidTransformer(trasformerOptions),
      type: 'varchar',
      unique: true,
    } as ColumnOptions,
    options || {},
  ) as ColumnOptions;

  return Column(options);
}
