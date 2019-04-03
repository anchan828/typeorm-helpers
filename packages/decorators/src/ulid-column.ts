import { Column, ColumnOptions } from 'typeorm';
import { monotonicFactory, ulid } from 'ulid';
const monotonic = monotonicFactory();
export interface UlidColumnOptions {
  // defaul: true
  isMonotonic: boolean;
}
export function UlidColumn(
  trasformerOptions?: UlidColumnOptions,
  options?: ColumnOptions,
) {
  options = Object.assign(
    {
      type: 'varchar',
      width: 26,
    },
    options || {},
  ) as ColumnOptions;

  trasformerOptions = Object.assign(
    {
      isMonotonic: true,
    },
    trasformerOptions || {},
  );

  return Column({
    ...options,
    default: () => `'${trasformerOptions!.isMonotonic ? monotonic() : ulid()}'`,
  });
}
