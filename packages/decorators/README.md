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

## License

[MIT](LICENSE)
