# @anchan828/typeorm-history

![npm](https://img.shields.io/npm/v/@anchan828/typeorm-history.svg)
![NPM](https://img.shields.io/npm/l/@anchan828/typeorm-history.svg)

## Description

Create History Entity for [TypeORM](http://typeorm.io)

## Installation

```bash
$ npm i --save @anchan828/typeorm-history
```

## Quick Start

### 1. Create Entity

```ts
@Entity()
class TestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    default: false,
  })
  public deleted!: boolean;

  @Column()
  public test!: string;
}
```

### 2. Create History Entity

```ts
@Entity()
class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public originalID!: number;

  @HistoryActionColumn()
  public action!: HistoryActionType;

  @Column()
  public historyReportID!: string;
}
```

### 3. Create Entity Subscriber for History

```ts
@EventSubscriber()
class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
  public createHistoryEntity(entity: TestEntity): TestHistoryEntity {
    const history = TestHistoryEntity.create(entity);
    history.originalID = entity.id;
    return history;
  }

  public listenTo(): Function {
    return TestEntity;
  }
}
```

### 4. Insert/Update/Remove entity

```ts
// Insert
const testEntity = await TestEntity.create({ test: 'test' }).save();

// Update
testEntity.test = 'updated';
await testEntity.save();

// Remove
testEntity.deleted = true;
await testEntity.save();

// Remove
await testEntity.remove();

```

![](https://i.gyazo.com/469466502dd8cbab540a8115336d2f07.png)

## License

[MIT](LICENSE)