import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, EventSubscriber, PrimaryGeneratedColumn } from "typeorm";
import { ulid } from "ulid";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryEntityInterface } from "../history-entity";
import { HistoryEntitySubscriber } from "../history-subscriber";

let messages: Array<{ hook: string; history: any; entity: any }> = [];

@Entity()
class TestEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public test!: string;
}

@Entity()
class TestHistoryEntity extends TestEntity implements HistoryEntityInterface {
  @Column()
  public originalID!: number;

  @HistoryActionColumn({ type: "varchar" })
  public action!: HistoryActionType;
  @PrimaryGeneratedColumn()
  public id!: number;
}

@EventSubscriber()
class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
  public entity = TestEntity;
  public historyEntity = TestHistoryEntity;

  public beforeInsertHistory(
    history: TestHistoryEntity,
    entity: Readonly<TestEntity>,
  ): TestHistoryEntity | Promise<TestHistoryEntity> {
    messages.push({
      hook: "beforeInsertHistory",
      history: { ...history },
      entity: { ...entity },
    });
    return history;
  }

  public afterInsertHistory(history: TestHistoryEntity, entity: Readonly<TestEntity>): void | Promise<void> {
    messages.push({
      hook: "afterInsertHistory",
      history: { ...history },
      entity: { ...entity },
    });
  }

  public beforeUpdateHistory(
    history: TestHistoryEntity,
    entity: Readonly<TestEntity>,
  ): TestHistoryEntity | Promise<TestHistoryEntity> {
    messages.push({
      hook: "beforeUpdateHistory",
      history: { ...history },
      entity: { ...entity },
    });
    return history;
  }
  public afterUpdateHistory(history: TestHistoryEntity, entity: Readonly<TestEntity>): void | Promise<void> {
    messages.push({
      hook: "afterUpdateHistory",
      history: { ...history },
      entity: { ...entity },
    });
  }

  public beforeRemoveHistory(
    history: TestHistoryEntity,
    entity: Readonly<TestEntity>,
  ): TestHistoryEntity | Promise<TestHistoryEntity> {
    messages.push({
      hook: "beforeRemoveHistory",
      history: { ...history },
      entity: { ...entity },
    });
    return history;
  }

  public afterRemoveHistory(history: TestHistoryEntity, entity: Readonly<TestEntity>): void | Promise<void> {
    messages.push({
      hook: "afterRemoveHistory",
      history: { ...history },
      entity: { ...entity },
    });
  }
}

e2eDatabaseTypeSetUp("e2e test (hooks)", (options) => {
  e2eSetUp(
    {
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
      ...options,
    },
    async () => {
      messages = [];
    },
  );

  it("create history", async () => {
    const testEntity = await TestEntity.create({ test: "test" }).save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(1);
    expect(histories[0].originalID).toBe(testEntity.id);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].test).toBe("test");
    expect(messages).toEqual([
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "CREATED",
          originalID: 1,
          test: "test",
        },
        hook: "beforeInsertHistory",
      },
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "CREATED",
          id: 1,
          originalID: 1,
          test: "test",
        },
        hook: "afterInsertHistory",
      },
    ]);
  });

  it("update history", async () => {
    const testEntity = await TestEntity.create({ test: "test" }).save();
    testEntity.test = "updated";
    await testEntity.save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].test).toBe("test");

    expect(histories[1].action).toBe(HistoryActionType.UPDATED);
    expect(histories[1].test).toBe("updated");

    expect(messages).toEqual([
      {
        hook: "beforeInsertHistory",
        history: {
          test: "test",
          action: "CREATED",
          originalID: 1,
        },
        entity: { test: "test", id: 1 },
      },
      {
        hook: "afterInsertHistory",
        history: {
          test: "test",
          action: "CREATED",
          originalID: 1,
          id: 1,
        },
        entity: { test: "test", id: 1 },
      },
      {
        hook: "beforeUpdateHistory",
        history: {
          test: "updated",
          action: "UPDATED",
          originalID: 1,
        },
        entity: { id: 1, test: "updated" },
      },
      {
        hook: "afterUpdateHistory",
        history: {
          test: "updated",
          action: "UPDATED",
          originalID: 1,
          id: 2,
        },
        entity: { id: 1, test: "updated" },
      },
    ]);
  });

  it("delete history", async () => {
    const testEntity = await TestEntity.create({ test: "test" }).save();
    await testEntity.remove();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[1].action).toBe(HistoryActionType.DELETED);
    expect(messages).toEqual([
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "CREATED",
          originalID: 1,
          test: "test",
        },
        hook: "beforeInsertHistory",
      },
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "CREATED",
          id: 1,
          originalID: 1,
          test: "test",
        },
        hook: "afterInsertHistory",
      },
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "DELETED",
          originalID: 1,
          test: "test",
        },
        hook: "beforeRemoveHistory",
      },
      {
        entity: {
          id: 1,
          test: "test",
        },
        history: {
          action: "DELETED",
          id: 2,
          originalID: 1,
          test: "test",
        },
        hook: "afterRemoveHistory",
      },
    ]);
  });

  it("create many histories", async () => {
    let entities = Array(100)
      .fill(0)
      .map(() => TestEntity.create({ test: ulid() }));
    entities = await TestEntity.save(entities);

    await expect(TestHistoryEntity.count()).resolves.toBe(100);
    entities.forEach((e) => (e.test = ulid()));
    await TestEntity.save(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(200);
    await TestEntity.remove(entities);
    await expect(TestHistoryEntity.count()).resolves.toBe(300);
    expect(messages.length).toEqual(600);
  });
});
