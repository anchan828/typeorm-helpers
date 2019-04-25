import { BooleanTransformer } from '@anchan828/typeorm-transformers';
import { Column, ColumnOptions } from 'typeorm';

export function BooleanColumn(options?: ColumnOptions) {
  const columnOptions = Object.assign(
    {
      transformer: new BooleanTransformer(),
      type: 'tinyint',
      width: 1,
    } as ColumnOptions,
    options || {},
  );

  if (columnOptions.default !== undefined) {
    columnOptions.default = columnOptions.default ? 1 : 0;
  }

  return Column(columnOptions);
}
