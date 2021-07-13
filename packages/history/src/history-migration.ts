import { EntityTarget, QueryRunner } from "typeorm";

export async function removeAllUniqueIndices(queryRunner: QueryRunner, target: EntityTarget<any>): Promise<void> {
  const metadata = queryRunner.connection.getMetadata(target);

  if (!metadata) {
    throw Error(`metadata not found`);
  }

  for (const index of metadata.indices) {
    if (!index.isUnique) {
      continue;
    }

    await queryRunner.dropIndex(metadata.tableName, index.name);
  }
}
