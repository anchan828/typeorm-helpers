import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BooleanColumn } from "./boolean-column";

e2eDatabaseTypeSetUp("BooleanColumn", (options) => {
  @Entity({ name: "test" })
  class BooleanColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @BooleanColumn({ default: false, type: "int" })
    public test!: boolean;

    @BooleanColumn({ default: true, type: "int" })
    public test2!: boolean;

    @BooleanColumn({ type: "int" })
    public test3!: boolean;
  }

  e2eSetUp({ entities: [BooleanColumnTest], ...options });

  it("should save entity", async () => {
    await BooleanColumnTest.create({
      test: true,
      test2: true,
      test3: true,
    }).save();
  });

  it("should use default value", async () => {
    const { id } = await BooleanColumnTest.create({ test3: true }).save();
    const entity = await BooleanColumnTest.findOne(id);

    expect(entity).toEqual({
      id: 1,
      test: false,
      test2: true,
      test3: true,
    });

    const rawEntity = await BooleanColumnTest.createQueryBuilder("test").whereInIds([id]).getRawOne();
    expect(rawEntity).toEqual({
      test_id: 1,
      test_test: 0,
      test_test2: 1,
      test_test3: 1,
    });
  });
});
