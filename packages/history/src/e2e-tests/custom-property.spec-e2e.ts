import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, DataSource, Entity, EventSubscriber, PrimaryGeneratedColumn } from "typeorm";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryOriginalIdColumn } from "../history-entity";
import { HistoryEntitySubscriber } from "../history-subscriber";

describe("e2e test (custom property)", () => {
  describe("create history (basic)", () => {
    @Entity()
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public test!: string;
    }

    @Entity()
    class TestHistoryEntity extends TestEntity {
      @HistoryOriginalIdColumn()
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
    }

    e2eSetUp({
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
    });

    it("basic", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].originalID).toBe(testEntity.id);
      expect(histories[0].action).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");
    });
  });

  describe("throw error (A originalID is not defined.)", () => {
    @Entity()
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public test!: string;
    }

    @Entity()
    class TestHistoryEntity extends TestEntity {
      @HistoryActionColumn({ name: "action" })
      public historyAction!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }

    e2eSetUp({
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
    });

    it("test", async () => {
      await expect(TestEntity.create({ test: "test" }).save()).rejects.toThrowError(
        "TestHistoryEntity does not have @HistoryOriginalIdColumn defined.",
      );
    });
  });

  describe("throw error (A originalID has already been defined.)", () => {
    @Entity()
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column({ nullable: true })
      public originalID!: number;

      @Column()
      public test!: string;
    }

    @Entity()
    class TestHistoryEntity extends TestEntity {
      @HistoryActionColumn({ name: "action" })
      public historyAction!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }

    e2eSetUp({
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
    });

    it("test", async () => {
      await expect(TestEntity.create({ test: "test" }).save()).rejects.toThrowError(
        "The originalID has already been defined for TestEntity. An entity cannot have a property with the same name.",
      );
      await expect(TestEntity.create({ test: "test", originalID: 1234 }).save()).rejects.toThrowError(
        "The originalID has already been defined for TestEntity. An entity cannot have a property with the same name.",
      );
    });
  });

  e2eDatabaseTypeSetUp("create history (change property name)", (options) => {
    @Entity()
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public test!: string;
    }

    @Entity()
    class TestHistoryEntity extends TestEntity {
      @HistoryOriginalIdColumn()
      public historyOriginalID!: number;

      @HistoryActionColumn({ type: "varchar" })
      public historyAction!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }

    e2eSetUp({
      entities: [TestEntity, TestHistoryEntity],
      subscribers: [TestHistoryEntitySubscriber],
      ...options,
    });

    it("test", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].historyOriginalID).toBe(testEntity.id);
      expect(histories[0].historyAction).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");
    });
  });

  describe("create history (change column name)", () => {
    @Entity()
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public test!: string;
    }

    @Entity()
    class TestHistoryEntity extends TestEntity {
      @HistoryOriginalIdColumn({ name: "historyOriginalID" })
      public originalID!: number;

      @HistoryActionColumn({ name: "historyAction" })
      public action!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }
    let dataSource: DataSource;
    e2eSetUp(
      {
        entities: [TestEntity, TestHistoryEntity],
        subscribers: [TestHistoryEntitySubscriber],
      },
      (source) => {
        dataSource = source;
      },
    );

    it("test", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].originalID).toBe(testEntity.id);
      expect(histories[0].action).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");

      await testEntity.remove();

      await expect(dataSource.query("SELECT * FROM test_history_entity")).resolves.toEqual([
        {
          historyAction: "CREATED",
          historyOriginalID: 1,
          id: 1,
          test: "test",
        },
        {
          historyAction: "DELETED",
          historyOriginalID: 1,
          id: 2,
          test: "test",
        },
      ]);
    });
  });
});
