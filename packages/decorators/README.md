# @anchan828/typeorm-decorators

![npm](https://img.shields.io/npm/v/@anchan828/typeorm-decorators.svg)
![NPM](https://img.shields.io/npm/l/@anchan828/typeorm-decorators.svg)

## Description

Decorator collection for [TypeORM](http://typeorm.io)

## Installation

```bash
$ npm i --save typeorm @anchan828/typeorm-decorators
```

## Quick Start

```ts
@Entity()
class UlidColumnTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @UlidColumn()
  public ulid!: string;
}
```

```ts
@Entity()
class StaticFileColumnTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @StaticFileColumn({ dirname: "/path/to/" })
  public file!: BinaryLike;
}
```

```ts
@Entity()
class EncryptTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  // key is createHash("sha256").update("test").digest("hex")
  @EncryptColumn({ key: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" })
  public password!: string;
}
```

## License

[MIT](LICENSE)
