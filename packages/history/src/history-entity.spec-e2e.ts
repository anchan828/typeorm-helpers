import {
  BaseEntity,
  Column,
  createConnection,
  Entity,
  EventSubscriber,
  getConnection,
  getRepository,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  QueryRunner,
  Unique,
} from "typeorm";
import { ulid } from "ulid";
import { HistoryActionType } from "./history-action.enum";
import { HistoryActionColumn, HistoryEntityInterface, HistoryOriginalIdColumn } from "./history-entity";
import { dropUniqueIndices } from "./history-migration";
import { HistoryEntitySubscriber } from "./history-subscriber";

describe("e2e test (basic)", () => {
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

    @HistoryActionColumn()
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
  beforeEach(async () => {
    const connection = await createConnection({
      database: "test",
      dropSchema: true,
      entities: [TestEntity, TestHistoryEntity, TestEntity2, TestHistoryEntity2],
      host: process.env.DB_HOST || "localhost",
      password: "root",
      subscribers: [TestHistoryEntitySubscriber, TestHistoryEntitySubscriber2],
      synchronize: true,
      type: (process.env.DB_TYPE || "mysql") as any,
      username: "root",
    });
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeTruthy();
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

  afterEach(() => getConnection().close());
});

describe("e2e test (many-to-many)", () => {
  @Entity()
  class Category {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public name!: string;
  }

  @Entity()
  class Question {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public title!: string;

    @Column()
    public text!: string;

    @ManyToMany(() => Category, { cascade: true })
    @JoinTable()
    public categories!: Category[];
  }

  @Entity()
  class CategoryHistory extends Category implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn()
    public action!: HistoryActionType;

    @PrimaryGeneratedColumn()
    public id!: number;
  }

  @Entity()
  class QuestionHistory extends Question implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn()
    public action!: HistoryActionType;

    @PrimaryGeneratedColumn()
    public id!: number;
  }

  @EventSubscriber()
  class CategoryHistorySubscriber extends HistoryEntitySubscriber<Category, CategoryHistory> {
    public entity = Category;
    public historyEntity = CategoryHistory;
  }

  @EventSubscriber()
  class QuestionHistorySubscriber extends HistoryEntitySubscriber<Question, QuestionHistory> {
    public entity = Question;
    public historyEntity = QuestionHistory;
  }

  beforeEach(async () => {
    const connection = await createConnection({
      database: "test",
      dropSchema: true,
      entities: [Category, CategoryHistory, Question, QuestionHistory],
      host: process.env.DB_HOST || "localhost",
      password: "root",
      subscribers: [CategoryHistorySubscriber, QuestionHistorySubscriber],
      synchronize: true,
      type: (process.env.DB_TYPE || "mysql") as any,
      username: "root",
    });
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeTruthy();
  });

  afterEach(() => getConnection().close());

  it("should create many-to-many create/update/delete history", async () => {
    // create tests
    const category1 = new Category();
    category1.name = "animals";

    const category2 = new Category();
    category2.name = "zoo";

    const question = new Question();
    question.title = "dogs";
    question.text = "who let the dogs out?";
    question.categories = [category1, category2];
    await getConnection().manager.save(question);

    await expect(getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
    ]);

    await expect(getRepository(QuestionHistory).find({})).resolves.toEqual([
      {
        action: "CREATED",
        id: 1,
        originalID: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
    ]);

    await expect(getRepository(Category).find({})).resolves.toEqual([
      { id: 1, name: "animals" },
      { id: 2, name: "zoo" },
    ]);

    await expect(getRepository(CategoryHistory).find({})).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
    ]);

    // update tests
    question.text = "updated";
    question.categories[0].name = "updated";

    await getConnection().manager.save(question);

    await expect(getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(QuestionHistory).find({})).resolves.toEqual([
      {
        action: "CREATED",
        id: 1,
        originalID: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
      {
        action: "UPDATED",
        id: 2,
        originalID: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(Category).find({})).resolves.toEqual([
      { id: 1, name: "updated" },
      { id: 2, name: "zoo" },
    ]);

    await expect(getRepository(CategoryHistory).find({})).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
    ]);

    // delete tests
    // remove first category
    await getConnection().manager.remove(question.categories.shift());

    await expect(getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(QuestionHistory).find({})).resolves.toEqual([
      {
        action: "CREATED",
        id: 1,
        originalID: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
      {
        action: "UPDATED",
        id: 2,
        originalID: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(Category).find({})).resolves.toEqual([{ id: 2, name: "zoo" }]);

    await expect(getRepository(CategoryHistory).find({})).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
      { action: "DELETED", id: 4, name: "updated", originalID: 1 },
    ]);

    // add new category tests
    const category3 = new Category();
    category3.name = "bar";
    question.categories.push(category3);
    await getConnection().manager.save(question);

    await expect(getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(QuestionHistory).find({})).resolves.toEqual([
      {
        action: "CREATED",
        id: 1,
        originalID: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
      {
        action: "UPDATED",
        id: 2,
        originalID: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(getRepository(Category).find({})).resolves.toEqual([
      { id: 2, name: "zoo" },
      { id: 3, name: "bar" },
    ]);

    await expect(getRepository(CategoryHistory).find({})).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
      { action: "DELETED", id: 4, name: "updated", originalID: 1 },
      { action: "CREATED", id: 5, name: "bar", originalID: 3 },
    ]);
  });
});

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

      @HistoryActionColumn()
      public action!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }

    beforeEach(async () => {
      const connection = await createConnection({
        database: "test",
        dropSchema: true,
        entities: [TestEntity, TestHistoryEntity],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [TestHistoryEntitySubscriber],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      });
      expect(connection).toBeDefined();
      expect(connection.isConnected).toBeTruthy();
    });

    it("basic", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].originalID).toBe(testEntity.id);
      expect(histories[0].action).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");
    });

    afterEach(() => getConnection().close());
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

    beforeEach(async () => {
      const connection = await createConnection({
        database: "test",
        dropSchema: true,
        entities: [TestEntity, TestHistoryEntity],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [TestHistoryEntitySubscriber],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      });
      expect(connection).toBeDefined();
      expect(connection.isConnected).toBeTruthy();
    });

    it("test", async () => {
      await expect(TestEntity.create({ test: "test" }).save()).rejects.toThrowError(
        "TestHistoryEntity does not have @HistoryOriginalIdColumn defined.",
      );
    });

    afterEach(() => getConnection().close());
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

    beforeEach(async () => {
      const connection = await createConnection({
        database: "test",
        dropSchema: true,
        entities: [TestEntity, TestHistoryEntity],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [TestHistoryEntitySubscriber],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      });
      expect(connection).toBeDefined();
      expect(connection.isConnected).toBeTruthy();
    });

    it("test", async () => {
      await expect(TestEntity.create({ test: "test" }).save()).rejects.toThrowError(
        "The originalID has already been defined for TestEntity. An entity cannot have a property with the same name.",
      );
      await expect(TestEntity.create({ test: "test", originalID: 1234 }).save()).rejects.toThrowError(
        "The originalID has already been defined for TestEntity. An entity cannot have a property with the same name.",
      );
    });

    afterEach(() => getConnection().close());
  });

  describe("create history (change property name)", () => {
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

      @HistoryActionColumn()
      public historyAction!: HistoryActionType;

      @PrimaryGeneratedColumn()
      public id!: number;
    }

    @EventSubscriber()
    class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
      public entity = TestEntity;
      public historyEntity = TestHistoryEntity;
    }

    beforeEach(async () => {
      const connection = await createConnection({
        database: "test",
        dropSchema: true,
        entities: [TestEntity, TestHistoryEntity],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [TestHistoryEntitySubscriber],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      });
      expect(connection).toBeDefined();
      expect(connection.isConnected).toBeTruthy();
    });

    it("test", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].historyOriginalID).toBe(testEntity.id);
      expect(histories[0].historyAction).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");
    });

    afterEach(() => getConnection().close());
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

    beforeEach(async () => {
      const connection = await createConnection({
        database: "test",
        dropSchema: true,
        entities: [TestEntity, TestHistoryEntity],
        host: process.env.DB_HOST || "localhost",
        password: "root",
        subscribers: [TestHistoryEntitySubscriber],
        synchronize: true,
        type: (process.env.DB_TYPE || "mysql") as any,
        username: "root",
      });
      expect(connection).toBeDefined();
      expect(connection.isConnected).toBeTruthy();
    });

    it("test", async () => {
      const testEntity = await TestEntity.create({ test: "test" }).save();
      const histories = await TestHistoryEntity.find();
      expect(histories).toHaveLength(1);
      expect(histories[0].originalID).toBe(testEntity.id);
      expect(histories[0].action).toBe(HistoryActionType.CREATED);
      expect(histories[0].test).toBe("test");

      await testEntity.remove();

      await expect(getConnection().query("SELECT * FROM test_history_entity")).resolves.toEqual([
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

    afterEach(() => getConnection().close());
  });
});

describe("e2e test (remove unique index)", () => {
  @Entity()
  @Unique(["uniqueId4"])
  @Index("test", ["uniqueId1", "uniqueId2"], { unique: true })
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

    @HistoryActionColumn()
    public action!: HistoryActionType;

    @PrimaryGeneratedColumn()
    public id!: number;
  }

  @EventSubscriber()
  class TestHistoryEntitySubscriber extends HistoryEntitySubscriber<TestEntity, TestHistoryEntity> {
    public entity = TestEntity;
    public historyEntity = TestHistoryEntity;
  }

  beforeEach(async () => {
    const connection = await createConnection({
      database: "test",
      dropSchema: true,
      entities: [TestEntity, TestHistoryEntity],
      host: process.env.DB_HOST || "localhost",
      password: "root",
      subscribers: [TestHistoryEntitySubscriber],
      synchronize: true,
      type: (process.env.DB_TYPE || "mysql") as any,
      username: "root",
      migrations: [
        class RemoveAllUniqueOfTestHistoryEntity1625470736630 {
          async up(queryRunner: QueryRunner): Promise<void> {
            await dropUniqueIndices(queryRunner, TestHistoryEntity /* "test_history_entity" */);
          }
        },
      ],
      migrationsRun: true,
    });
    expect(connection).toBeDefined();
    expect(connection.isConnected).toBeTruthy();
  });

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

  afterEach(() => getConnection().close());
});
