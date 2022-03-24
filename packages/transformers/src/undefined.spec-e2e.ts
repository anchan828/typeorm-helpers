import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UndefinedTransformer } from "./undefined";
e2eDatabaseTypeSetUp("UndefinedTransformer", (options) => {
  @Entity()
  class UndefinedTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new UndefinedTransformer(),
      type: "varchar",
    })
    public test?: string;
  }

  e2eSetUp({ entities: [UndefinedTransformerTest], ...options });

  it("should return undefined", async () => {
    const test = await UndefinedTransformerTest.create({}).save();

    expect(await UndefinedTransformerTest.findOne(test.id)).toEqual({
      test: undefined,
      id: 1,
    });
  });

  it("should return string", async () => {
    const test = await UndefinedTransformerTest.create({
      test: "test",
    }).save();

    expect(await UndefinedTransformerTest.findOne(test.id)).toEqual({ test: "test", id: 1 });
  });
});
