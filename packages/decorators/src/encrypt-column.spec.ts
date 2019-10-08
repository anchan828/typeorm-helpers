import { EncryptColumn } from "./encrypt-column";

describe("EncryptColumn", () => {
  it("should be defined", () => {
    expect(EncryptColumn).toBeDefined();
  });

  it("should be defined", () => {
    class Test {
      @EncryptColumn({ key: "test" })
      public test!: string;
    }

    expect(new Test()).toBeDefined();
  });
});
