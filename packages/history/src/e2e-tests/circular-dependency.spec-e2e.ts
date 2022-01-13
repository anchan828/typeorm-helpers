import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import {
  BaseEntity,
  Column,
  Entity,
  EventSubscriber,
  getConnection,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { HistoryActionType } from "../history-action.enum";
import { HistoryActionColumn, HistoryEntityInterface } from "../history-entity";
import { HistoryEntitySubscriber } from "../history-subscriber";

@Entity()
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public name!: string;

  @OneToMany(() => Page, (page) => page.book, { onDelete: "SET NULL" })
  public pages!: Page[];
}

@Entity()
export class Page extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public name!: string;

  @ManyToOne(() => Book, (book) => book.pages, { onDelete: "SET NULL" })
  public book!: Book;
}

@Entity()
export class BookHistory extends Book implements HistoryEntityInterface {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public originalID!: number;

  @HistoryActionColumn({ type: "varchar" })
  public action!: HistoryActionType;
}

@Entity()
export class PageHistory extends Page implements HistoryEntityInterface {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public originalID!: number;

  @HistoryActionColumn({ type: "varchar" })
  public action!: HistoryActionType;
}

@EventSubscriber()
export class BookHistorySubscriber extends HistoryEntitySubscriber<Book, BookHistory> {
  public get entity() {
    return Book;
  }

  public get historyEntity() {
    return BookHistory;
  }
}

@EventSubscriber()
export class PageHistorySubscriber extends HistoryEntitySubscriber<Page, PageHistory> {
  public get entity() {
    return Page;
  }

  public get historyEntity() {
    return PageHistory;
  }
}

e2eDatabaseTypeSetUp("e2e test (basic)", (options) => {
  e2eSetUp({
    entities: [Book, BookHistory, Page, PageHistory],
    subscribers: [BookHistorySubscriber, PageHistorySubscriber],
    ...options,
  });

  it("create history", async () => {
    await Page.create({ name: "page", book: await Book.create({ name: "book" }).save() }).save();

    await Page.create({ name: "page", book: await Book.create({ name: "book" }).save() }).save();

    const books = await Book.createQueryBuilder("book")
      .leftJoinAndMapMany("book.pages", Page, "page", "book.id = page.bookId")
      .getMany();

    const firstBook: Book = books[0];
    const firstPage: Page = firstBook.pages[0];

    const secondBook = books[1];
    const secondPage: Page = secondBook.pages[0];

    firstPage.book = Book.create(secondBook);
    secondPage.book = Book.create(firstBook);

    await getConnection().transaction((manager) => manager.save([firstPage, secondPage]));

    await expect(BookHistory.createQueryBuilder("book_history").getRawMany()).resolves.toEqual([
      {
        book_history_action: "CREATED",
        book_history_id: 1,
        book_history_name: "book",
        book_history_originalID: 1,
      },
      {
        book_history_action: "CREATED",
        book_history_id: 2,
        book_history_name: "book",
        book_history_originalID: 2,
      },
    ]);

    await expect(PageHistory.createQueryBuilder("page_history").getRawMany()).resolves.toEqual([
      {
        page_history_action: "CREATED",
        page_history_bookId: 1,
        page_history_id: 1,
        page_history_name: "page",
        page_history_originalID: 1,
      },
      {
        page_history_action: "CREATED",
        page_history_bookId: 2,
        page_history_id: 2,
        page_history_name: "page",
        page_history_originalID: 2,
      },
      {
        page_history_action: "UPDATED",
        page_history_bookId: 2,
        page_history_id: 3,
        page_history_name: "page",
        page_history_originalID: 1,
      },
      {
        page_history_action: "UPDATED",
        page_history_bookId: 1,
        page_history_id: 4,
        page_history_name: "page",
        page_history_originalID: 2,
      },
    ]);
  });
});
