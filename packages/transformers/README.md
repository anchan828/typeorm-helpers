# @anchan828/typeorm-transformers

![npm](https://img.shields.io/npm/v/@anchan828/typeorm-transformers.svg)
![NPM](https://img.shields.io/npm/l/@anchan828/typeorm-transformers.svg)

## Description

Transformer collection for [TypeORM](http://typeorm.io)

## Installation

```bash
$ npm i --save typeorm @anchan828/typeorm-transformers
```

## Quick Start

```ts
@Entity()
class BooleanTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: 'tinyint',
    width: 1,
    nullable: true,
    transformer: new BooleanTransformer(),
  })
  public bool!: boolean;
}
```

```ts
class TestJson {
  name!: string;
}
@Entity()
class JsonTransformerTest extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: 'varchar',
    width: 255,
    nullable: true,
    transformer: new JsonTransformer<TestJson>({ name: 'test' }),
  })
  public data!: TestJson;
}
```

## License

[MIT](LICENSE)