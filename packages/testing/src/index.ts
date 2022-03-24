import { DataSource, DataSourceOptions } from "typeorm";

export function e2eDatabaseTypeSetUp(name: string, callback: (options: Partial<DataSourceOptions>) => void): void;
export function e2eDatabaseTypeSetUp(
  name: string,
  ignoreTypes: string[],
  callback: (options: Partial<DataSourceOptions>) => void,
): void;
export function e2eDatabaseTypeSetUp(
  name: string,
  callbackOrIgnoreTypes: string[] | Function,
  callbackFunction?: (options: Partial<DataSourceOptions>) => void,
): void {
  const ignoreTypes: string[] = [];
  let callback: Function | undefined;
  if (Array.isArray(callbackOrIgnoreTypes)) {
    ignoreTypes.push(...callbackOrIgnoreTypes);
    callback = callbackFunction;
  } else {
    callback = callbackOrIgnoreTypes;
  }

  const options: Array<Partial<DataSourceOptions>> = [
    { type: "mysql", database: "test" },
    { type: "postgres", database: "test" },
    { type: "sqlite", database: ":memory:" },
  ].filter((x) => !ignoreTypes.includes(x.type + "")) as Array<Partial<DataSourceOptions>>;

  describe.each<Partial<DataSourceOptions>>(options)(`[$type] ${name}`, (options) => {
    jest.retryTimes(5);
    callback?.(options);
  });
}

export async function e2eSetUp(
  options?: Partial<DataSourceOptions>,
  callback?: (dataSource: DataSource) => void | Promise<void>,
): Promise<void> {
  let dataSource: DataSource;
  beforeEach(async () => {
    const opt = Object.assign<DataSourceOptions, Partial<DataSourceOptions>>(
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

    dataSource = await new DataSource(opt).initialize();

    await callback?.(dataSource);
  });

  afterEach(async () => {
    await dataSource.destroy();
  });
}
