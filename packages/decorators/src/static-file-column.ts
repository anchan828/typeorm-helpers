import {
  StaticFileTransformer,
  StaticFileTransformerOptions,
} from '@anchan828/typeorm-transformers';
import { Column, ColumnOptions } from 'typeorm';

export function StaticFileColumn(
  this: any,
  trasformerOptions: StaticFileTransformerOptions,
  options?: ColumnOptions,
) {
  return Column(
    Object.assign(
      {
        transformer: new StaticFileTransformer(trasformerOptions),
        type: 'varchar',
        width: 255,
      } as ColumnOptions,
      options || {},
    ),
  ).bind(this);
}
