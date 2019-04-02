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
  type: 'mysql',
  entities: [TestEntity, TestHistoryEntity],
  subscribers: [TestHistoryEntitySubscriber],
  username: 'root',
  password: 'test',
  database: 'test',
});
```


### 5. Insert/Update/Remove entity

```ts
// Insert
const testEntity = await TestEntity.create({ test: 'test' }).save();

// Update
testEntity.test = 'updated';
await testEntity.save();

// Remove
await testEntity.remove();

```

![](https://i.gyazo.com/14df4832443c22a72042e20a84a5aa57.png)

## Advanced

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

  public beforeInsertHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterInsertHistory(history: HistoryEntityType): void | Promise<void> {
    
  }

  public beforeUpdateHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterUpdateHistory(history: HistoryEntityType): void | Promise<void> {
    
  }

  public beforeRemoveHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }
  
  public afterRemoveHistory(history: HistoryEntityType): void | Promise<void> {
    
  }
}
```

## License

[MIT](LICENSE)