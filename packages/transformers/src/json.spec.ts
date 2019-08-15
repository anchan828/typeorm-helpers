import { JsonTransformer } from "./json";

describe("JsonTransformer", () => {
  const jsonTransformer = new JsonTransformer({ test: "defaultValue" });

  it("should be defined", () => {
    expect(jsonTransformer).toBeDefined();
  });

  describe("from", () => {
    it("should return undefined", () => {
      expect(new JsonTransformer().from(null)).toBeUndefined();
      expect(new JsonTransformer().from(undefined)).toBeUndefined();
    });
    it("should return defaultValue", () => {
      expect(jsonTransformer.from(null)).toStrictEqual({
        test: "defaultValue",
      });
      expect(jsonTransformer.from(undefined)).toStrictEqual({
        test: "defaultValue",
      });
    });

    it("should return object", () => {
      expect(jsonTransformer.from(JSON.stringify({ test: "test" }))).toStrictEqual({
        test: "test",
      });
    });

    it("should return defaultValue", () => {
      expect(jsonTransformer.from("invalid")).toStrictEqual({
        test: "defaultValue",
      });
    });
  });

  describe("to", () => {
    it("should return undefined", () => {
      expect(new JsonTransformer().to(null)).toBeUndefined();
    });
    it("should return undefined", () => {
      expect(new JsonTransformer().to(undefined)).toBeUndefined();
    });
    it("should return defaultValue", () => {
      expect(jsonTransformer.to(null)).toStrictEqual(
        JSON.stringify({
          test: "defaultValue",
        }),
      );
      expect(jsonTransformer.to(undefined)).toStrictEqual(
        JSON.stringify({
          test: "defaultValue",
        }),
      );
    });

    it("should return json", () => {
      expect(jsonTransformer.to({ test: "test" })).toStrictEqual(JSON.stringify({ test: "test" }));
    });
  });
});
