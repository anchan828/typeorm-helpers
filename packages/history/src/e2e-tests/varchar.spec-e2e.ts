import { BaseEntity, Column, Entity, EventSubscriber, PrimaryGeneratedColumn } from "typeorm";
import { ulid } from "ulid";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryEntityInterface } from "../history-entity";
import { HistoryEntitySubscriber } from "../history-subscriber";
import { e2eSetUp } from "./e2e-setup";

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

  @HistoryActionColumn({ type: "varchar", length: "7" })
  public action!: HistoryActionType;

  @PrimaryGeneratedColumn()
  public id!: number;
}

@EventSubscriber()
class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
  public entity = TestEntity;
  public historyEntity = TestHistoryEntity;
}

@Entity()
class TestEntity2 extends BaseEntity {
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
class TestHistoryEntity2 extends TestEntity2 implements HistoryEntityInterface {
  @Column()
  public originalID!: number;

  @HistoryActionColumn()
  public action!: HistoryActionType;
  @PrimaryGeneratedColumn()
  public id!: number;
}

@EventSubscriber()
class TestHistoryEntitySubscriber2 extends HistoryEntitySubscriber<TestEntity2, TestHistoryEntity2> {
  public entity = TestEntity2;
  public historyEntity = TestHistoryEntity2;

  public beforeUpdateHistory(history: TestHistoryEntity2): TestHistoryEntity2 {
    if (history.deleted) {
      history.action = HistoryActionType.DELETED;
    }
    return history;
  }
}

describe("e2e test (overwrite type to varchar)", () => {
  e2eSetUp({
    entities: [TestEntity, TestHistoryEntity, TestEntity2, TestHistoryEntity2],
    subscribers: [TestHistoryEntitySubscriber, TestHistoryEntitySubscriber2],
  });

  it("create history", async () => {
    const testEntity = await TestEntity.create({ test: "test" }).save();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(1);
    expect(histories[0].originalID).toBe(testEntity.id);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].test).toBe("test");
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
  });
  it("delete history", async () => {
    const testEntity = await TestEntity.create({ test: "test" }).save();
    await testEntity.remove();

    const histories = await TestHistoryEntity.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[1].action).toBe(HistoryActionType.DELETED);
  });
  it("should be delete action when deleted column is true", async () => {
    const testEntity = await TestEntity2.create({ test: "test" }).save();
    testEntity.deleted = true;
    await testEntity.save();

    const histories = await TestHistoryEntity2.find();
    expect(histories).toHaveLength(2);
    expect(histories[0].action).toBe(HistoryActionType.CREATED);
    expect(histories[0].deleted).toBeFalsy();

    expect(histories[1].action).toBe(HistoryActionType.DELETED);
    expect(histories[1].deleted).toBeTruthy();
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
  });
});
