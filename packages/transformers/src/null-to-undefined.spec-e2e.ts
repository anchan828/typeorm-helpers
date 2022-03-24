import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { NullToUndefinedTransformer } from "./null-to-undefined";
e2eDatabaseTypeSetUp("NullToUndefinedTransformer", (options) => {
  @Entity()
  class NullToUndefinedTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new NullToUndefinedTransformer(),
      type: "varchar",
    })
    public test?: string;
  }

  e2eSetUp({ entities: [NullToUndefinedTransformerTest], ...options });

  it("should return undefined", async () => {
    const test = await NullToUndefinedTransformerTest.create({}).save();

    expect(await NullToUndefinedTransformerTest.findOne(test.id)).toEqual({
      test: undefined,
      id: 1,
    });
  });

  it("should return string", async () => {
    const test = await NullToUndefinedTransformerTest.create({
      test: "test",
    }).save();

    expect(await NullToUndefinedTransformerTest.findOne(test.id)).toEqual({ test: "test", id: 1 });
  });
});
