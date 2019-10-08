import { BaseEntity, Column, Entity, getConnection, getManager, PrimaryGeneratedColumn } from "typeorm";
import { EncryptColumn } from "./encrypt-column";
import { createTestConnection } from "./test-utils";
describe("EncryptColumn", () => {
  @Entity({ name: "encrypt_test" })
  class EncryptTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @EncryptColumn({ key: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" })
    public password!: string;

    @Column({ nullable: true })
    public test!: string;
  }

  beforeEach(async () => {
    await createTestConnection([EncryptTransformerTest]);
  });

  it("should return hash", async () => {
    let test = await EncryptTransformerTest.create({
      password: "test",
    }).save();

    await expect(EncryptTransformerTest.findOne(test.id)).resolves.toEqual({
      id: 1,
      test: null,
    });

    const { password } = await getManager()
      .createQueryBuilder(EncryptTransformerTest, "test")
      .whereInIds([test.id])
      .select("password")
      .getRawOne();

    expect(password).toEqual(expect.any(String));
    test = await EncryptTransformerTest.findOneOrFail(test.id);
    test.test = "added";

    await test.save();

    const { password2 } = await getManager()
      .createQueryBuilder(EncryptTransformerTest, "test")
      .whereInIds([test.id])
      .select("password as password2")
      .getRawOne();

    expect(password).toBe(password2);
  });

  afterEach(() => getConnection().close());
});
