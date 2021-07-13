# @anchan828/typeorm-history

![npm](https://img.shields.io/npm/v/@anchan828/typeorm-history.svg)
![NPM](https://img.shields.io/npm/l/@anchan828/typeorm-history.svg)

## Description

Create History Entity for [TypeORM](http://typeorm.io)

Tested: mysql5, mysql8 and postgres.

## Installation

```bash
$ npm i --save typeorm @anchan828/typeorm-history
```

## Quick Start

### 1. Create Entity

```ts
@Entity()
class TestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public test!: string;
}
```

### 2. Create History Entity

```ts
@Entity()
class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
  @HistoryOriginalIdColumn()
  public originalID!: number;

  @HistoryActionColumn()
  public action!: HistoryActionType;
}
```

Note: Starting with version 0.5.0, column names can be defined freely.

```ts
@Entity()
class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
  // You can use any property name you like.
  @HistoryOriginalIdColumn()
  public history_originalID!: number;

  // You can rename column name
  @HistoryActionColumn({ name: "history_action" })
  public action!: HistoryActionType;
}
```

### 3. Create Entity Subscriber for History

```ts
@EventSubscriber()
class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
  public get entity() {
    return TestEntity;
  }
  public get historyEntity() {
    return TestHistoryEntity;
  }
}
```

### 4. Create connection

```ts
await createConnection({
  type: "mysql",
  entities: [TestEntity, TestHistoryEntity],
  subscribers: [TestHistoryEntitySubscriber],
  username: "root",
  password: "test",
  database: "test",
});
```

### 5. Insert/Update/Remove entity

```ts
// Insert
const testEntity = await TestEntity.create({ test: "test" }).save();

// Update
testEntity.test = "updated";
await testEntity.save();

// Remove
await testEntity.remove();
```

![](https://i.gyazo.com/c5c25280122bfe423533f8db269d04f4.png)

## Advanced

### Hooks

You can hook before/after insert/update/remove history.

```ts
@EventSubscriber()
class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
  public get entity() {
    return TestEntity;
  }

  public get historyEntity() {
    return TestHistoryEntity;
  }

  public beforeInsertHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterInsertHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}

  public beforeUpdateHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterUpdateHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}

  public beforeRemoveHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterRemoveHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}
}
```

### Drop unique indices

The history table stores multiple entities with the same content, so it won't work well if there is a yunique index. You will need to drop the all unique indices.
So I prepared a helper function for migration.

```ts
export class DropAllUniqueOfTestHistoryEntity1625470736630 {
  async up(queryRunner: QueryRunner): Promise<void> {
    await dropUniqueIndices(queryRunner, TestHistoryEntity /* "test_history_entity" */);
  }

  async down(queryRunner: QueryRunner): Promise<void> {}
}
```

If you want to regenerate the index with the unique flag removed, please set keepIndex to true.

```ts
export class DropAllUniqueOfTestHistoryEntity1625470736630 {
  async up(queryRunner: QueryRunner): Promise<void> {
    await dropUniqueIndices(queryRunner, "test_history_entity", true);
  }
}
```

## License

[MIT](LICENSE)
