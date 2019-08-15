import { BinaryLike } from "crypto";
import { tmpdir } from "os";
import { BaseEntity, Entity, getConnection, PrimaryGeneratedColumn } from "typeorm";
import { StaticFileColumn } from "./static-file-column";
import { createTestConnection } from "./test-utils";

describe("StaticFileColumn", () => {
  @Entity()
  class StaticFileColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @StaticFileColumn({ dirname: tmpdir() })
    public file!: BinaryLike;
  }

  beforeEach(async () => {
    await createTestConnection([StaticFileColumnTest]);
  });
  afterEach(() => getConnection().close());

  it("should be defined", async () => {
    await StaticFileColumnTest.create({ file: "test" }).save();
  });
});
