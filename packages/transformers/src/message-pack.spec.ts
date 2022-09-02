import { pack } from "msgpackr";
import { MessagePackTransformer } from "./message-pack";

describe("MessagePackTransformer", () => {
  const messagePackTransformer = new MessagePackTransformer({ test: "defaultValue" });

  it("should be defined", () => {
    expect(messagePackTransformer).toBeDefined();
  });

  describe("from", () => {
    it("should return undefined", () => {
      expect(new MessagePackTransformer().from(null)).toBeUndefined();
      expect(new MessagePackTransformer().from(undefined)).toBeUndefined();
    });
    it("should return defaultValue", () => {
      expect(messagePackTransformer.from(null)).toStrictEqual({
        test: "defaultValue",
      });
      expect(messagePackTransformer.from(undefined)).toStrictEqual({
        test: "defaultValue",
      });
    });

    it("should return object", () => {
      expect(messagePackTransformer.from(pack({ test: "test" }))).toStrictEqual({
        test: "test",
      });
    });

    it("should return defaultValue", () => {
      expect(messagePackTransformer.from("invalid" as any)).toStrictEqual({
        test: "defaultValue",
      });
    });
  });

  describe("to", () => {
    it("should return undefined", () => {
      expect(new MessagePackTransformer().to(null)).toBeUndefined();
    });
    it("should return undefined", () => {
      expect(new MessagePackTransformer().to(undefined)).toBeUndefined();
    });
    it("should return defaultValue", () => {
      expect(messagePackTransformer.to(null)).toStrictEqual(
        pack({
          test: "defaultValue",
        }),
      );
      expect(messagePackTransformer.to(undefined)).toStrictEqual(
        pack({
          test: "defaultValue",
        }),
      );
    });

    it("should return json", () => {
      const transformer = new MessagePackTransformer();
      const date = new Date();
      expect(transformer.from(transformer.to({ test: "test", date }))).toStrictEqual({ test: "test", date });
    });
  });
});
