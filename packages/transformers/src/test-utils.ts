import { ConnectionOptions, createConnection } from 'typeorm';
export const createTestConnection = async (entities: any[]) => {
  return createConnection({
    type: 'mysql',
    supportBigNumbers: true,
    bigNumberStrings: true,
    entities,
    username: 'root',
    password: 'test',
    database: 'test',
    synchronize: true,
    dropSchema: true,
    // logging: 'all',
  } as ConnectionOptions);
};
