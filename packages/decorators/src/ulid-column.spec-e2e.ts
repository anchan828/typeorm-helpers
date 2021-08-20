/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UlidColumn } from "./ulid-column";

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
  e2eSetUp({ entities: [UlidColumnMonotonicTest, UlidColumnNotMonotonicTest], ...options });

  it("should be defined", async () => {
    await UlidColumnMonotonicTest.create().save();
    await UlidColumnNotMonotonicTest.create().save();
  });

  it("should set ulid", async () => {
    await UlidColumnMonotonicTest.create().save();
    const test = await UlidColumnMonotonicTest.findOne();
    test!.text2 = "a";
    await test!.save();
    const test2 = await UlidColumnMonotonicTest.findOne();

    expect(test!.text).toBe(test2!.text);
    test2!.text = "a";
    await test2!.save();
    const test3 = await UlidColumnMonotonicTest.findOne();
    expect(test3!.text).toBe("a");
  });

  it("should not set ulid when set to text", async () => {
    await UlidColumnMonotonicTest.create().save();
    const test = await UlidColumnMonotonicTest.findOne();
    test!.text = "a";
    await test!.save();
    const test2 = await UlidColumnMonotonicTest.findOne();
    expect(test2!.text).toBe("a");
  });
});
