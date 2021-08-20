import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";
import { JsonColumn } from "./json-column";

interface TestInterface {
  hoge: string;
  foo: number;
}

e2eDatabaseTypeSetUp("JsonColumn", (options) => {
  @Entity({ name: "test" })
  class JsonColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @JsonColumn<{ tags: number[]; date: Date }>({ default: { tags: [], date: new Date() } })
    public test!: { tags: number[]; date: Date };

    @JsonColumn<TestInterface>({ nullable: true })
    public test2!: TestInterface;

    @JsonColumn({ nullable: true })
    public test3!: string;
  }

  e2eSetUp({ entities: [JsonColumnTest], ...options });

  it("should save entity", async () => {
    await JsonColumnTest.create({
      test: { tags: [1, 2, 3], date: new Date() },
    }).save();

    await expect(JsonColumnTest.find({})).resolves.toEqual([
      {
        id: 1,
        test: {
          date: expect.any(Date),
          tags: [1, 2, 3],
        },
      },
    ]);
  });
});
