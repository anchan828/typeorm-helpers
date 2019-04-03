import { BooleanTransformer } from '@anchan828/typeorm-transformers';
import { Column, ColumnOptions } from 'typeorm';

export function BooleanColumn(this: any, options?: ColumnOptions) {
  return Column(
    Object.assign(
      {
        transformer: new BooleanTransformer(),
        type: 'tinyint',
        width: 1,
      } as ColumnOptions,
      options || {},
    ),
  ).bind(this);
}
