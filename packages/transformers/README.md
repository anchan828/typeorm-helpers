# @anchan828/typeorm-transformers

![npm](https://img.shields.io/npm/v/@anchan828/typeorm-transformers.svg)
![NPM](https://img.shields.io/npm/l/@anchan828/typeorm-transformers.svg)

## Description

Transformer collection for [TypeORM](http://typeorm.io)

## Installation

```bash
$ npm i --save typeorm @anchan828/typeorm-transformers
```

## Transformers

### BooleanTransformer

Transform value between integer and boolean.

```ts
@Entity()
class BooleanTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: "tinyint",
    width: 1,
    nullable: true,
    transformer: new BooleanTransformer(),
  })
  public bool!: boolean;
}
```

### JsonTransformer

Transform value between object and json.

Note: The JsonTransformer stores JSON as a string, not as a JSON type.

```ts
class TestJson {
  name!: string;
}
@Entity()
class JsonTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: "varchar",
    width: 255,
    nullable: true,
    transformer: new JsonTransformer<TestJson>({ name: "test" }),
  })
  public data!: TestJson;
}
```

### StaticFileTransformer

Transform value between data and filePath.

```ts
@Entity()
class StaticFileTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    transformer: new StaticFileTransformer({ dirname: tmpdir() }),
    type: "varchar",
  })
  public file!: BinaryLike;
}
```

### MessagePackTransformer

Please install msgpackr when using this Transformer.

```shell
npm i msgpackr
```

Transform value between object and messagepack.
Currently only mysql and postgres are supported.

The type of column depends on the database used:

- mysql: Use `blob`
- postgres: Use `bytea`

```ts
@Entity()
class MessagePackTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    transformer: new MessagePackTransformer<TestJson>({ name: "test" }),
    type: options.type === "mysql" ? "blob" : "bytea",
  })
  public data!: TestJson;
}
```

## License

[MIT](LICENSE)
