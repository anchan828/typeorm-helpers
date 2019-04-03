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
  trasformerOptions = Object.assign(
    {
      isMonotonic: true,
    },
    trasformerOptions || {},
  );

  const defaultFunction = (): string => {
    return `'${trasformerOptions!.isMonotonic ? monotonic() : ulid()}'`;
  };

  options = Object.assign(
    {
      default: defaultFunction,
      length: '26',
      type: 'varchar',
    } as ColumnOptions,
    options || {},
  ) as ColumnOptions;

  return Column(options);
}
