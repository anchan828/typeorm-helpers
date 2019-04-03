import { Column, ColumnOptions } from 'typeorm';
import { monotonicFactory, ulid } from 'ulid';
const monotonic = monotonicFactory();
export interface UlidColumnOptions {
  // defaul: true
  isMonotonic: boolean;
}
export function UlidColumn(
  this: any,
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
      default: () =>
        `'${trasformerOptions!.isMonotonic ? monotonic() : ulid()}'`,
      length: '26',
      type: 'varchar',
    } as ColumnOptions,
    options || {},
  ) as ColumnOptions;

  return Column(options).bind(this);
}
