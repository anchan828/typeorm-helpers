import { BinaryLike } from "crypto";
import { readFileSync } from "fs";
import { tmpdir } from "os";
import { BaseEntity, Column, Entity, getConnection, PrimaryGeneratedColumn } from "typeorm";
import { StaticFileTransformer } from "./static-file";
import { createTestConnection } from "./test-utils";

describe("StaticFileTransformer", () => {
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

  beforeEach(async () => {
    await createTestConnection([StaticFileTransformerTest]);
  });

  it("should store text", async () => {
    const test = await StaticFileTransformerTest.create({
      file: "test",
    }).save();
    expect(test.file).toBe("test");

    const rawQuery = await getConnection().query("SELECT * FROM `static_file_transformer_test` WHERE `id`=?", [
      test.id,
    ]);
    expect(rawQuery).toHaveLength(1);
    expect((rawQuery[0].file as string).startsWith(tmpdir())).toBeTruthy();
  });

  it("should store image", async () => {
    const test = await StaticFileTransformerTest.create({
      file: readFileSync("test-files/image.png"),
    }).save();
    expect(test.file).toEqual(readFileSync("test-files/image.png"));

    const rawQuery = await getConnection().query("SELECT * FROM `static_file_transformer_test` WHERE `id`=?", [
      test.id,
    ]);
    expect(rawQuery).toHaveLength(1);
    expect((rawQuery[0].file as string).startsWith(tmpdir())).toBeTruthy();
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

  afterEach(() => getConnection().close());
});
