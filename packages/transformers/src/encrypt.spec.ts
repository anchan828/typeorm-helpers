import { EncryptTransformer } from "./encrypt";

describe("EncryptTransformer", () => {
  const encryptTransformer = new EncryptTransformer({
    key: "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  });

  it("should be defined", () => {
    expect(encryptTransformer).toBeDefined();
  });

  describe("to", () => {
    it("should return undefined", () => {
      expect(encryptTransformer.to(null)).toBeUndefined();
    });
    it("should return undefined", () => {
      expect(encryptTransformer.to(undefined)).toBeUndefined();
    });

    it("should return encrypted data", () => {
      expect(encryptTransformer.to("test")).toEqual(expect.any(String));
    });
  });

  describe("from", () => {
    it("should return undefined", () => {
      expect(encryptTransformer.from(null)).toBeUndefined();
    });
    it("should return undefined", () => {
      expect(encryptTransformer.from(undefined)).toBeUndefined();
    });

    it("should return decrypted data", () => {
      expect(encryptTransformer.from("h5Tg0GlO/724pWGcXNGdDiXEICWJnGeHsr9pfpFOgs8=")).toBe("test");
    });
  });
});
