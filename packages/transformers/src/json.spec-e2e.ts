import { BaseEntity, Column, Entity, getConnection, PrimaryGeneratedColumn } from "typeorm";
import { JsonTransformer } from "./json";
import { createTestConnection } from "./test-utils";
describe("JsonTransformer", () => {
  class TestJson {
    public name!: string;
  }

  @Entity()
  class JsonTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new JsonTransformer<TestJson>({ name: "test" }),
      type: "varchar",
      width: 255,
    })
    public data!: TestJson;
  }

  beforeEach(async () => {
    await createTestConnection([JsonTransformerTest]);
  });

  it("should return undefined", async () => {
    @Entity()
    class NoDefaultValueTest extends BaseEntity {
      @PrimaryGeneratedColumn()
      public id!: number;

      @Column({
        nullable: true,
        transformer: new JsonTransformer(),
        type: "varchar",
        width: 255,
      })
      public data!: TestJson;
    }
    await getConnection().close();
    await createTestConnection([NoDefaultValueTest]);
    const test = await NoDefaultValueTest.create({}).save();

    expect(await NoDefaultValueTest.findOne(test.id)).toEqual({
      data: undefined,
      id: 1,
    });
  });

  it("should return defaultValue", async () => {
    const test = await JsonTransformerTest.create().save();

    expect(await JsonTransformerTest.findOne(test.id)).toEqual({
      data: {
        name: "test",
      },
      id: test.id,
    });

    const rawQuery = await getConnection().query("SELECT * FROM `json_transformer_test` WHERE `id`=?", [test.id]);

    expect(rawQuery).toHaveLength(1);
    expect(rawQuery[0]).toHaveProperty("data", JSON.stringify({ name: "test" }));
  });

  it("should return defaultValue", async () => {
    await getConnection().query("INSERT INTO `json_transformer_test` (`id`, `data`) VALUES (?, ?)", [1, "test"]);

    expect(await JsonTransformerTest.findOne(1)).toEqual({
      data: {
        name: "test",
      },
      id: 1,
    });
  });

  afterEach(() => getConnection().close());
});
