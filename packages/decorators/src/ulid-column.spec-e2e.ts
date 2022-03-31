/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { PrimaryUlidColumn, UlidColumn } from "./ulid-column";

e2eDatabaseTypeSetUp("UlidColumn", (options) => {
  @Entity()
  class UlidColumnMonotonicTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @UlidColumn()
    public text!: string;

    @Column({ nullable: true })
    public text2!: string;
  }

  @Entity()
  class UlidColumnNotMonotonicTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @UlidColumn({ isMonotonic: false })
    public text!: string;
  }

  @Entity()
  class PrimaryUlidColumnTest extends BaseEntity {
    @PrimaryUlidColumn()
    public id!: string;
  }

  e2eSetUp({ entities: [UlidColumnMonotonicTest, UlidColumnNotMonotonicTest, PrimaryUlidColumnTest], ...options });

  it("should be defined", async () => {
    await UlidColumnMonotonicTest.create().save();
    await UlidColumnNotMonotonicTest.create().save();
    await PrimaryUlidColumnTest.create().save();
  });

  it("should set ulid", async () => {
    await UlidColumnMonotonicTest.create().save();
    const test = await UlidColumnMonotonicTest.find();
    test[0].text2 = "a";
    await test[0].save();
    const test2 = await UlidColumnMonotonicTest.find();

    expect(test[0].text).toBe(test2[0].text);
    test2[0].text = "a";
    await test2[0].save();
    const test3 = await UlidColumnMonotonicTest.find();
    expect(test3[0].text).toBe("a");

    await PrimaryUlidColumnTest.create().save();
    const test4 = await PrimaryUlidColumnTest.find();
    expect(test4[0].id.length).toEqual(26);
  });

  it("should not set ulid when set to text", async () => {
    await UlidColumnMonotonicTest.create().save();
    const test = await UlidColumnMonotonicTest.find();
    test[0].text = "a";
    await test[0].save();
    const test2 = await UlidColumnMonotonicTest.find();
    expect(test2[0].text).toBe("a");
  });
});
