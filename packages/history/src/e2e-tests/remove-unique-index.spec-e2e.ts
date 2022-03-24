import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import {
  BaseEntity,
  Column,
  Entity,
  EventSubscriber,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  QueryRunner,
  Unique,
} from "typeorm";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryOriginalIdColumn } from "../history-entity";
import { dropUniqueIndices } from "../history-migration";
import { HistoryEntitySubscriber } from "../history-subscriber";

e2eDatabaseTypeSetUp("e2e test (remove unique index)", (options) => {
  describe("basic", () => {
    @Entity()
    @Unique(["uniqueId4"])
    @Index(["uniqueId1", "uniqueId2"], { unique: true })
    @Index(
      () => {
        return {
          uniqueId1: 3,
          uniqueId2: 2,
          uniqueId3: 1,
        };
      },
      { unique: true },
    )
    class TestEntity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public test!: string;

      @Column({ unique: true })
      public uniqueId1!: number;

      @Column()
      @Index({ unique: true })
      public uniqueId2!: number;

      @Column()
      @Unique(["uniqueId3"])
      public uniqueId3!: number;

      @Column()
      public uniqueId4!: number;
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
    e2eSetUp(
      {
        entities: [TestEntity, TestHistoryEntity],
        subscribers: [TestHistoryEntitySubscriber],
        migrations: [
          class RemoveAllUniqueOfTestHistoryEntity1625470736630 {
            async up(queryRunner: QueryRunner): Promise<void> {
              await dropUniqueIndices(queryRunner, TestHistoryEntity /* "test_history_entity" */, true);
            }
          },
        ],
        ...options,
      },
      async (source) => {
        await source.runMigrations();
      },
    );

    it("create history", async () => {
      const testEntity = await TestEntity.create({
        test: "test",
        uniqueId1: 1,
        uniqueId2: 2,
        uniqueId3: 3,
        uniqueId4: 4,
      }).save();

      testEntity.test = "updated";

      await testEntity.save();
    });
  });

  describe("foreign key (one-to-one)", () => {
    @Entity()
    class Test2Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @Entity()
    class Test1Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public text!: string;

      @OneToOne(() => Test2Entity)
      @JoinColumn()
      public test2!: Test2Entity;
    }

    @Entity()
    class Test1HistoryEntity extends Test1Entity {
      @HistoryOriginalIdColumn()
      public originalID!: number;

      @HistoryActionColumn({ type: "varchar" })
      public action!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class Test1HistoryEntitySubscriber extends HistoryEntitySubscriber<Test1Entity, Test1HistoryEntity> {
      public entity = Test1Entity;
      public historyEntity = Test1HistoryEntity;
    }

    e2eSetUp(
      {
        entities: [Test1Entity, Test2Entity, Test1HistoryEntity],
        subscribers: [Test1HistoryEntitySubscriber],
        migrations: [
          class RemoveAllUniqueOfTestHistoryEntity1625470736630 {
            async up(queryRunner: QueryRunner): Promise<void> {
              await dropUniqueIndices(queryRunner, Test1HistoryEntity /* "test_history_entity" */, true);
            }
          },
        ],
      },
      async (source) => {
        await source.runMigrations();
      },
    );

    it("create history", async () => {
      const test2 = await Test2Entity.create({}).save();
      const test1 = await Test1Entity.create({ test2, text: "text" }).save();

      test1.text = "updated";

      await test1.save();
    });
  });

  describe("foreign key (many-to-one)", () => {
    @Entity({ name: "test2" })
    class Test2Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @ManyToOne("test1", () => "test2array")
      public test1!: any;
    }

    @Entity({ name: "test1" })
    class Test1Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public text!: string;
    }

    @Entity()
    class Test1HistoryEntity extends Test1Entity {
      @HistoryOriginalIdColumn()
      public originalID!: number;

      @HistoryActionColumn({ type: "varchar" })
      public action!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class Test1HistoryEntitySubscriber extends HistoryEntitySubscriber<Test1Entity, Test1HistoryEntity> {
      public entity = Test1Entity;
      public historyEntity = Test1HistoryEntity;
    }

    e2eSetUp(
      {
        entities: [Test1Entity, Test2Entity, Test1HistoryEntity],
        subscribers: [Test1HistoryEntitySubscriber],
        migrations: [
          class RemoveAllUniqueOfTestHistoryEntity1625470736630 {
            async up(queryRunner: QueryRunner): Promise<void> {
              await dropUniqueIndices(queryRunner, Test1HistoryEntity /* "test_history_entity" */, true);
            }
          },
        ],
      },
      async (source) => {
        await source.runMigrations();
      },
    );

    it("create history", async () => {
      const test1 = await Test1Entity.create({ text: "text" }).save();
      await Test2Entity.create({ test1 }).save();
      await Test2Entity.create({ test1 }).save();
      test1.text = "updated";

      await test1.save();
    });
  });

  describe("foreign key (one-to-many)", () => {
    @Entity({ name: "test2" })
    class Test2Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @ManyToOne("test1", () => "test2array")
      public test1!: any;
    }

    @Entity({ name: "test1" })
    class Test1Entity extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column()
      public text!: string;

      @OneToMany(() => Test2Entity, (test2) => test2.test1)
      public test2array!: Test2Entity[];
    }

    @Entity()
    class Test1HistoryEntity extends Test1Entity {
      @HistoryOriginalIdColumn()
      public originalID!: number;

      @HistoryActionColumn({ type: "varchar" })
      public action!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class Test1HistoryEntitySubscriber extends HistoryEntitySubscriber<Test1Entity, Test1HistoryEntity> {
      public entity = Test1Entity;
      public historyEntity = Test1HistoryEntity;
    }

    e2eSetUp(
      {
        entities: [Test1Entity, Test2Entity, Test1HistoryEntity],
        subscribers: [Test1HistoryEntitySubscriber],
        migrations: [
          class RemoveAllUniqueOfTestHistoryEntity1625470736630 {
            async up(queryRunner: QueryRunner): Promise<void> {
              await dropUniqueIndices(queryRunner, Test1HistoryEntity /* "test_history_entity" */, true);
            }
          },
        ],
      },
      async (source) => {
        await source.runMigrations();
      },
    );

    it("create history", async () => {
      const test1 = await Test1Entity.create({ text: "text" }).save();
      await Promise.all(Test2Entity.create([{ test1 }, { test1 }]).map((x) => x.save()));
      test1.text = "updated";

      await test1.save();
    });
  });
});
