import { ConnectionOptions, createConnection } from 'typeorm';
export const createTestConnection = async (entities: any[]) => {
  return createConnection({
    bigNumberStrings: true,
    database: 'test',
    dropSchema: true,
    entities,
    password: 'root',
    supportBigNumbers: true,
    synchronize: true,
    host: process.env.DB_HOST || 'localhost',
    type: (process.env.DB_TYPE || 'mysql') as any,
    username: 'root',
  } as ConnectionOptions);
};
