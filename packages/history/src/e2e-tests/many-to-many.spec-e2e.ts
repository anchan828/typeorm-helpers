import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { Column, DataSource, Entity, EventSubscriber, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryEntityInterface } from "../history-entity";
import { HistoryEntitySubscriber } from "../history-subscriber";

e2eDatabaseTypeSetUp("e2e test (many-to-many)", (options) => {
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

    @HistoryActionColumn({ type: "varchar" })
    public action!: HistoryActionType;

    @PrimaryGeneratedColumn()
    public id!: number;
  }

  @Entity()
  class QuestionHistory extends Question implements HistoryEntityInterface {
    @Column()
    public originalID!: number;

    @HistoryActionColumn({ type: "varchar" })
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
  let dataSource: DataSource;
  e2eSetUp(
    {
      entities: [Category, CategoryHistory, Question, QuestionHistory],
      subscribers: [CategoryHistorySubscriber, QuestionHistorySubscriber],
      ...options,
    },
    (source) => {
      dataSource = source;
    },
  );

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
    await dataSource.manager.save(question);

    await expect(dataSource.getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
    ]);

    await expect(dataSource.getRepository(QuestionHistory).find({})).resolves.toEqual([
      {
        action: "CREATED",
        id: 1,
        originalID: 1,
        text: "who let the dogs out?",
        title: "dogs",
      },
    ]);

    await expect(dataSource.getRepository(Category).find({ order: { id: "ASC" } })).resolves.toEqual([
      { id: 1, name: "animals" },
      { id: 2, name: "zoo" },
    ]);

    await expect(dataSource.getRepository(CategoryHistory).find({})).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
    ]);

    // update tests
    question.text = "updated";
    question.categories[0].name = "updated";

    await dataSource.manager.save(question);

    await expect(dataSource.getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(dataSource.getRepository(QuestionHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
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

    await expect(dataSource.getRepository(Category).find({ order: { id: "ASC" } })).resolves.toEqual([
      { id: 1, name: "updated" },
      { id: 2, name: "zoo" },
    ]);

    await expect(dataSource.getRepository(CategoryHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
    ]);

    // delete tests
    // remove first category
    await dataSource.manager.remove(question.categories.shift());

    await expect(dataSource.getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(dataSource.getRepository(QuestionHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
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

    await expect(dataSource.getRepository(Category).find({})).resolves.toEqual([{ id: 2, name: "zoo" }]);

    await expect(dataSource.getRepository(CategoryHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
      { action: "DELETED", id: 4, name: "updated", originalID: 1 },
    ]);

    // add new category tests
    const category3 = new Category();
    category3.name = "bar";
    question.categories.push(category3);
    await dataSource.manager.save(question);

    await expect(dataSource.getRepository(Question).find({})).resolves.toEqual([
      {
        id: 1,
        text: "updated",
        title: "dogs",
      },
    ]);

    await expect(dataSource.getRepository(QuestionHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
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

    await expect(dataSource.getRepository(Category).find({ order: { id: "ASC" } })).resolves.toEqual([
      { id: 2, name: "zoo" },
      { id: 3, name: "bar" },
    ]);

    await expect(dataSource.getRepository(CategoryHistory).find({ order: { id: "ASC" } })).resolves.toEqual([
      { action: "CREATED", id: 1, name: "animals", originalID: 1 },
      { action: "CREATED", id: 2, name: "zoo", originalID: 2 },
      { action: "UPDATED", id: 3, name: "updated", originalID: 1 },
      { action: "DELETED", id: 4, name: "updated", originalID: 1 },
      { action: "CREATED", id: 5, name: "bar", originalID: 3 },
    ]);
  });
});
