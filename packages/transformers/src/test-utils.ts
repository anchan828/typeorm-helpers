import { ConnectionOptions, createConnection } from 'typeorm';
export const createTestConnection = async (entities: any[]) => {
  return createConnection({
    bigNumberStrings: true,
    database: 'test',
    dropSchema: true,
    entities,
    host: process.env.DB_HOST || 'localhost',
    password: 'root',
    supportBigNumbers: true,
    synchronize: true,
    type: (process.env.DB_TYPE || 'mysql') as any,
    username: 'root',
  } as ConnectionOptions);
};
