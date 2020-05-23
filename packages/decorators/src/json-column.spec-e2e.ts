import { BaseEntity, Entity, getConnection, getManager, PrimaryGeneratedColumn } from "typeorm";
import { JsonColumn } from "./json-column";
import { createTestConnection } from "./test-utils";

interface TestInterface {
  hoge: string;
  foo: number;
}

describe("JsonColumn", () => {
  @Entity({ name: "test" })
  class JsonColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @JsonColumn<{ tags: number[] }>({ default: { tags: [] } })
    public test!: { tags: number[] };

    @JsonColumn<TestInterface>({ nullable: true })
    public test2!: TestInterface;

    @JsonColumn({ nullable: true })
    public test3!: string;
  }

  beforeEach(async () => {
    await createTestConnection([JsonColumnTest]);
  });
  afterEach(() => getConnection().close());

  it("should save entity", async () => {
    await JsonColumnTest.create({
      test: { tags: [1, 2, 3] },
    }).save();
  });

  it("should search array", async () => {
    await JsonColumnTest.create({
      test: { tags: [1, 2, 3] },
    }).save();

    await JsonColumnTest.create({
      test: { tags: [3, 4, 5] },
    }).save();

    const result = await getManager()
      .createQueryBuilder(JsonColumnTest, "entity")
      .where("JSON_CONTAINS(test, ':tag', '$.tags')", { tag: 1 })
      .getRawMany();
    expect(result).toBeDefined();
  });
});
