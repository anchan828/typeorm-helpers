import { EntityTarget, QueryRunner, Table, TableIndex } from "typeorm";

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

  const table = await getTable(queryRunner, metadata.tablePath);

  const uniqueIndices = table.indices.filter((i) => i.isUnique).map((x) => x.clone());

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

  const uniques = table.uniques.map((x) => x.clone());

  for (const unique of uniques) {
    await queryRunner.dropUniqueConstraint(table, unique);
    if (keepIndex) {
      await queryRunner.createIndex(
        table,
        new TableIndex({
          columnNames: unique.columnNames,
          isUnique: false,
        }),
      );
    }
  }
}

async function getTable(queryRunner: QueryRunner, tablePath: string): Promise<Table> {
  const table = await queryRunner.getTable(tablePath);

  if (!table) {
    throw Error(`'${tablePath}' table not found`);
  }

  return table;
}
