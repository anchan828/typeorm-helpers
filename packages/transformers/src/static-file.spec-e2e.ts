import { BinaryLike } from "crypto";
import { readFileSync } from "fs";
import { tmpdir } from "os";
import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, Entity, getConnection, PrimaryGeneratedColumn } from "typeorm";
import { StaticFileTransformer } from "./static-file";

e2eDatabaseTypeSetUp("StaticFileTransformer", (options) => {
  const transformer = new StaticFileTransformer({ dirname: tmpdir() });
  @Entity()
  class StaticFileTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      transformer,
      type: "varchar",
    })
    public file!: BinaryLike;
  }
  e2eSetUp({ entities: [StaticFileTransformerTest], ...options });

  it("should store text", async () => {
    const test = await StaticFileTransformerTest.create({
      file: "test",
    }).save();
    expect(test.file).toBe("test");

    const rawQuery = await getConnection()
      .createQueryBuilder(StaticFileTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();
    expect(rawQuery.entity_file.startsWith(tmpdir())).toBeTruthy();
  });

  it("should store image", async () => {
    const test = await StaticFileTransformerTest.create({
      file: readFileSync("test-files/image.png"),
    }).save();
    expect(test.file).toEqual(readFileSync("test-files/image.png"));

    const rawQuery = await getConnection()
      .createQueryBuilder(StaticFileTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();
    expect(rawQuery.entity_file.startsWith(tmpdir())).toBeTruthy();
  });

  it("should not called when not select static file column", async () => {
    await StaticFileTransformerTest.create({
      file: readFileSync("test-files/image.png"),
    }).save();
    const mock = jest.spyOn(transformer, "from").mockReturnValueOnce(undefined);
    await StaticFileTransformerTest.createQueryBuilder("test").getOne();
    expect(mock).toBeCalled();
    mock.mockReset();

    await StaticFileTransformerTest.createQueryBuilder("test").select("test.id").getOne();
    expect(mock).not.toBeCalled();
  });
});
