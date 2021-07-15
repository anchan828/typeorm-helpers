import { EntityTarget, QueryRunner, TableIndex } from "typeorm";

/**
 * Helper function for drop unique indices for history entity.
 * The default is to drop the all unique indices.
 * If you want to regenerate the index with the unique flag removed, please set keepIndex to true.
 *
 * @param {QueryRunner} queryRunner
 * @param {EntityTarget<any>} target
 * @param {boolean} [keepIndex=false] If false, drop the index. If true, regenerate the index with the unique flag removed.
 * @return {*}  {Promise<void>}
 */
export async function dropUniqueIndices(
  queryRunner: QueryRunner,
  target: EntityTarget<any>,
  keepIndex = false,
): Promise<void> {
  const metadata = queryRunner.connection.getMetadata(target);

  if (!metadata) {
    throw Error(`metadata not found`);
  }
  const dropForeignKeyNames: string[] = [];
  for (const foreignKey of metadata.foreignKeys) {
    for (const column of foreignKey.columns) {
      // @OneToOne creates a unique index.
      if (column.relationMetadata?.isOneToOne) {
        dropForeignKeyNames.push(foreignKey.name);
        continue;
      }
    }
  }

  for (const dropForeignKeyName of dropForeignKeyNames) {
    await queryRunner.dropForeignKey(metadata.tableName, dropForeignKeyName);
  }

  const table = await queryRunner.getTable(metadata.tablePath);

  if (!table) {
    throw Error(`'${metadata.tablePath}' table not found`);
  }

  const uniqueIndices = table.indices.filter((i) => i.isUnique);

  for (const uniqueIndex of uniqueIndices) {
    await queryRunner.dropIndex(table, uniqueIndex);

    if (keepIndex) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          columnNames: uniqueIndex.columnNames,
          isUnique: false,
          isSpatial: uniqueIndex.isSpatial,
          isFulltext: uniqueIndex.isFulltext,
          name: uniqueIndex.name,
          parser: uniqueIndex.parser,
          where: uniqueIndex.where,
        }),
      );
    }
  }
}
