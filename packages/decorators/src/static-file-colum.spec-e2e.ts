import { BinaryLike } from "crypto";
import { tmpdir } from "os";
import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Entity, PrimaryGeneratedColumn } from "typeorm";
import { StaticFileColumn } from "./static-file-column";

e2eDatabaseTypeSetUp("StaticFileColumn", (options) => {
  @Entity()
  class StaticFileColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @StaticFileColumn({ dirname: tmpdir() })
    public file!: BinaryLike;
  }

  e2eSetUp({ entities: [StaticFileColumnTest], ...options });

  it("should be defined", async () => {
    await StaticFileColumnTest.create({ file: "test" }).save();
  });
});
