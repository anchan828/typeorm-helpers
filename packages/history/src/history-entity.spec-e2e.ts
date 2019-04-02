import {
  BaseEntity,
  Column,
  createConnection,
  Entity,
  EventSubscriber,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ulid } from 'ulid';
import { HistoryActionType } from './history-action.enum';
import {
  HistoryActionColumn,
  HistoryEntityInterface,
  HistoryEntitySubscriber,
} from './history-entity';

describe('test', () => {
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

  @Entity()
  class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn()
    public action!: HistoryActionType;
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public historyReportID!: string;
  }

  @EventSubscriber()
  class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<
    TestEntity,
    TestHistoryEntity
  > {
    public createHistoryEntity(entity: TestEntity): TestHistoryEntity {
      const history = TestHistoryEntity.create(entity);
      history.originalID = entity.id;
      return history;
    }
    public listenTo(): Function {
      return TestEntity;
    }
  }
  beforeEach(async () => {
    const connection = await createConnection({
      type: 'mysql',
      supportBigNumbers: true,
      bigNumberStrings: true,
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
      username: 'root',
      password: 'test',
      database: 'test',
      synchronize: true,
      dropSchema: true,
    });
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeTruthy();
  });

  it('create history', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(1);
    expect(histories[0].originalID).toBe(testEntity.id);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].test).toBe('test');
  });

  it('update history', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();
    testEntity.test = 'updated';
    await testEntity.save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].test).toBe('test');

    expect(histories[1].action).toBe(HistoryActionType.UPDATED);
    expect(histories[1].test).toBe('updated');
  });

  it('delete history1', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();
    testEntity.deleted = true;
    await testEntity.save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].deleted).toBeFalsy();

    expect(histories[1].action).toBe(HistoryActionType.DELETED);
    expect(histories[1].deleted).toBeTruthy();
  });

  it('delete history2', async () => {
    const testEntity = await TestEntity.create({ test: 'test' }).save();
    await testEntity.remove();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].deleted).toBeFalsy();

    expect(histories[1].action).toBe(HistoryActionType.DELETED);
    expect(histories[1].deleted).toBeTruthy();
  });

  it('create many histories', async () => {
    let entities = Array(100)
      .fill(0)
      .map(_ => TestEntity.create({ test: ulid() }));
    entities = await TestEntity.save(entities);

    await expect(TestHistoryEntity.count()).resolves.toBe(100);
    entities.forEach(e => (e.test = ulid()));
    await TestEntity.save(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(200);
    await TestEntity.remove(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(300);
  });

  afterEach(() => getConnection().close());
});
