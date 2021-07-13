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

  for (const index of metadata.indices) {
    if (!index.isUnique) {
      continue;
    }

    await queryRunner.dropIndex(metadata.tableName, index.name);

    if (keepIndex) {
      const columnNames = Object.entries(index.columnNamesWithOrderingMap)
        .sort(([, a], [, b]) => a - b)
        .map((x) => x[0]);

      await queryRunner.createIndex(
        metadata.tableName,
        new TableIndex({
          columnNames,
          isUnique: false,
          isSpatial: index.isSpatial,
          isFulltext: index.isFulltext,
          name: index.name,
          parser: index.parser,
          where: index.where,
        }),
      );
    }
  }
}
