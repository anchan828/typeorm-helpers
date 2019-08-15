import { HmacColumn } from "./hmac-column";

describe("HmacColumn", () => {
  it("should be defined", () => {
    expect(HmacColumn).toBeDefined();
  });

  it("should be defined", () => {
    class Test {
      @HmacColumn()
      public test!: string;
    }

    expect(new Test()).toBeDefined();
  });
});
