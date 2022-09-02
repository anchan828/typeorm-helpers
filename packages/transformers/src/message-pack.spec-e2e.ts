import { pack } from "msgpackr";
import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, DataSource, Entity, PrimaryGeneratedColumn } from "typeorm";
import { MessagePackTransformer } from "./message-pack";
e2eDatabaseTypeSetUp("MessagePackTransformer", (options) => {
  if (options.type === "sqlite") {
    return;
  }

  class TestJson {
    public name!: string;
  }

  @Entity()
  class MessagePackTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      transformer: new MessagePackTransformer<TestJson>({ name: "test" }),
      type: options.type === "mysql" ? "blob" : "bytea",
    })
    public data!: TestJson;
  }

  @Entity()
  class NoDefaultValueTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new MessagePackTransformer(),
      type: options.type === "mysql" ? "blob" : "bytea",
    })
    public data!: TestJson;
  }

  let dataSource: DataSource;

  e2eSetUp({ entities: [MessagePackTransformerTest, NoDefaultValueTest], ...options }, (source) => {
    dataSource = source;
  });

  it("should return undefined", async () => {
    const test = await NoDefaultValueTest.create({}).save();

    expect(await NoDefaultValueTest.findOneBy({ id: test.id })).toEqual({
      data: undefined,
      id: 1,
    });
  });

  it("should return defaultValue", async () => {
    const test = await MessagePackTransformerTest.create().save();

    expect(await MessagePackTransformerTest.findOneBy({ id: test.id })).toEqual({
      data: {
        name: "test",
      },
      id: test.id,
    });

    const rawQuery = await dataSource
      .createQueryBuilder(MessagePackTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();

    expect(rawQuery).toEqual({
      entity_data: pack({ name: "test" }),
      entity_id: 1,
    });
  });
});
