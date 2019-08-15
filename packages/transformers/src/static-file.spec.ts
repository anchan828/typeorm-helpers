/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { StaticFileTransformer } from "./static-file";
describe("StaticFileTransformer", () => {
  it("should throw error when dirname is undefined", () => {
    expect(() => {
      return new StaticFileTransformer({
        dirname: undefined as any,
      });
    }).toThrowError("Required dirname path or dirname function");
  });

  it("should create instance", () => {
    expect(
      new StaticFileTransformer({
        dirname: tmpdir(),
        filename: "test",
      }),
    ).toBeDefined();

    expect(
      new StaticFileTransformer({
        dirname: tmpdir(),
        filename: (filename: string): string => filename,
      }),
    ).toBeDefined();
  });

  describe("from", () => {
    const createFilePath = (value: string): string | undefined => {
      return new StaticFileTransformer({
        dirname: tmpdir(),
      }).to(value);
    };

    it("should return undefined", () => {
      expect(
        new StaticFileTransformer({
          dirname: tmpdir(),
        }).from(undefined),
      ).toBeUndefined();
    });

    it("should return text", () => {
      expect(
        new StaticFileTransformer({
          dirname: tmpdir(),
          encoding: "utf8",
        }).from(createFilePath("text")),
      ).toBe("text");
    });

    it("should return filePath when writeOnly is true", () => {
      const filePath = createFilePath("text");
      expect(
        new StaticFileTransformer({
          dirname: tmpdir(),
          writeOnly: true,
        }).from(filePath),
      ).toBe(filePath);
    });

    it("should throw error when filePath not under dirname", () => {
      const filePath = createFilePath("text");
      expect(() => {
        new StaticFileTransformer({
          dirname: `${tmpdir()}/hoge/`,
        }).from(filePath);
      }).toThrowError(`${tmpdir()}/372ea08cab33e71c02c651dbc83a474d32c676ea is not under the directory.`);
    });

    it("should throw error when filePath not exists", () => {
      const filePath = createFilePath("text");
      expect(() => {
        new StaticFileTransformer({
          dirname: `${tmpdir()}`,
        }).from(`${filePath}a`);
      }).toThrowError(`${filePath}a not found.`);
    });
  });

  describe("to", () => {
    it("should return filePath", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
      });
      expect(transformer.to(undefined)).toBeUndefined();
    });
    it("should return filePath", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
      });
      const filePath = transformer.to("test");
      expect(filePath).toBeDefined();
      expect(filePath!.startsWith(dirname)).toBeTruthy();
      expect(filePath).toBe(join(dirname, "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"));
    });

    it("should return filePath with txt extension", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
        filename: (filename: string): string => `${filename}.txt`,
      });
      const filePath = transformer.to("test")!;
      expect(filePath.startsWith(dirname)).toBeTruthy();
      expect(filePath).toBe(join(dirname, "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3.txt"));
    });

    it("should return same filePath", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
        filename: `test.txt`,
      });
      const filePath1 = transformer.to("A")!;
      const filePath2 = transformer.to("B")!;
      expect(filePath1).toBe(filePath2);
      expect(filePath1).toBe(join(dirname, "test.txt"));
    });

    it("should create sub directory", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
        filename: (filename: string): string => `sub/${filename}`,
      });
      expect(transformer.to("test")).toBe(join(dirname, "sub/a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"));
    });

    it("should create new filePath when pass wrong one", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
      });
      expect(transformer.to(`/path/to/text.txt`)).toBe(join(dirname, "de4ef8b5be48a7fe65ace20f202dcf1db27ab6ed"));
    });

    it("should return filePath when pass one", () => {
      const dirname = tmpdir();
      const transformer = new StaticFileTransformer({
        dirname,
      });
      expect(transformer.to(join(dirname, "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"))).toBe(
        join(dirname, "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3"),
      );
    });
  });

  describe("image test", () => {
    it("should return buffer", () => {
      const transformer = new StaticFileTransformer({
        dirname: tmpdir(),
        filename: (filename: string): string => `${filename}.png`,
      });
      const buffer = readFileSync("test-files/image.png");
      const filePath = transformer.to(buffer);
      expect(filePath).toBe(join(tmpdir(), "83a0d2a74f0352bed191dbf96fb20b7591c744e3.png"));
      expect(buffer).toEqual(transformer.from(filePath));
    });

    it("should return base64", () => {
      const transformer = new StaticFileTransformer({
        dirname: tmpdir(),
        encoding: "base64",
        filename: (filename: string): string => `${filename}.png`,
      });
      const base64 = readFileSync("test-files/image.png", "base64");
      const filePath = transformer.to(readFileSync("test-files/image.png"));
      expect(filePath).toBe(join(tmpdir(), "83a0d2a74f0352bed191dbf96fb20b7591c744e3.png"));
      expect(base64).toEqual(transformer.from(filePath));
    });
  });
});
