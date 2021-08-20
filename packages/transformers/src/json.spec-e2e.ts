import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, getConnection, PrimaryGeneratedColumn } from "typeorm";
import { JsonTransformer } from "./json";
e2eDatabaseTypeSetUp("JsonTransformer", (options) => {
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

  e2eSetUp({ entities: [JsonTransformerTest, NoDefaultValueTest], ...options });

  it("should return undefined", async () => {
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

    const rawQuery = await getConnection()
      .createQueryBuilder(JsonTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();

    expect(rawQuery).toEqual({
      entity_data: JSON.stringify({ name: "test" }),
      entity_id: 1,
    });
  });

  it("should return defaultValue", async () => {
    await JsonTransformerTest.create({
      data: "{" as any,
    }).save();

    expect(await JsonTransformerTest.findOne(1)).toEqual({
      data: {
        name: "test",
      },
      id: 1,
    });
  });
});
