import { NullToUndefinedTransformer } from "./null-to-undefined";

describe("NullToUndefinedTransformer", () => {
  const undefinedTransformer = new NullToUndefinedTransformer();

  it("should be defined", () => {
    expect(undefinedTransformer).toBeDefined();
  });

  describe("from", () => {
    it("should return undefined", () => {
      expect(undefinedTransformer.from(null)).toBeUndefined();
    });
    it("should return undefined", () => {
      expect(undefinedTransformer.from(undefined)).toBeUndefined();
    });

    it("should return 0", () => {
      expect(undefinedTransformer.from(0)).toEqual(0);
    });

    it("should return string", () => {
      expect(undefinedTransformer.from("test")).toEqual("test");
    });

    it("should return true", () => {
      expect(undefinedTransformer.from(true)).toBeTruthy();
    });
  });

  describe("to", () => {
    it("should return null", () => {
      expect(undefinedTransformer.to(null)).toBeNull();
    });
    it("should return undefined", () => {
      expect(undefinedTransformer.to(undefined)).toBeUndefined();
    });

    it("should return false", () => {
      expect(undefinedTransformer.to(false)).toBeFalsy();
    });

    it("should return true", () => {
      expect(undefinedTransformer.to(true)).toBeTruthy();
    });
  });
});
