import { ConnectionOptions, createConnection } from 'typeorm';
export const createTestConnection = async (entities: any[]) => {
  return createConnection({
    bigNumberStrings: true,
    database: 'test',
    dropSchema: true,
    entities,
    password: 'test',
    supportBigNumbers: true,
    synchronize: true,
    type: 'mysql',
    username: 'root',
  } as ConnectionOptions);
};
