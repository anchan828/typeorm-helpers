import { Connection, ConnectionOptions, createConnection } from "typeorm";

export function e2eDatabaseTypeSetUp(name: string, callback: (options: Partial<ConnectionOptions>) => void): void;
export function e2eDatabaseTypeSetUp(
  name: string,
  ignoreTypes: string[],
  callback: (options: Partial<ConnectionOptions>) => void,
): void;
export function e2eDatabaseTypeSetUp(
  name: string,
  callbackOrIgnoreTypes: string[] | Function,
  callbackFunction?: (options: Partial<ConnectionOptions>) => void,
): void {
  const ignoreTypes: string[] = [];
  let callback: Function | undefined;
  if (Array.isArray(callbackOrIgnoreTypes)) {
    ignoreTypes.push(...callbackOrIgnoreTypes);
    callback = callbackFunction;
  } else {
    callback = callbackOrIgnoreTypes;
  }

  const options: Array<Partial<ConnectionOptions>> = [
    { type: "mysql", database: "test" },
    { type: "postgres", database: "test" },
    { type: "sqlite", database: ":memory:" },
  ].filter((x) => !ignoreTypes.includes(x.type + "")) as Array<Partial<ConnectionOptions>>;

  describe.each<Partial<ConnectionOptions>>(options)(`[$type] ${name}`, (options) => {
    jest.retryTimes(5);
    callback?.(options);
  });
}

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
        host: "localhost",
        password: "root",
        subscribers: [],
        synchronize: true,
        type: "mysql",
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
