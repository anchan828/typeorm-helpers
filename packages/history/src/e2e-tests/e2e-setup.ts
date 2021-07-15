import { Connection, ConnectionOptions, createConnection } from "typeorm";

export async function e2eSetUp(
  options?: Partial<ConnectionOptions>,
  callback?: (connection: Connection) => Promise<void>,
): Promise<void> {
  let connection: Connection;
  beforeEach(async () => {
    const opt = Object.assign<ConnectionOptions, Partial<ConnectionOptions>>(
      {
        database: "test",
        dropSchema: true,
        entities: [],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      },
      options || {},
    );

    connection = await createConnection(opt);
    await callback?.(connection);
  });

  afterEach(async () => {
    await connection.close();
  });
}
