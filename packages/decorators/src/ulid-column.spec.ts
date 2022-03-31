import { PrimaryUlidColumn, UlidColumn } from "./ulid-column";

describe("UlidColumn", () => {
  it("should be defined", () => {
    expect(UlidColumn).toBeDefined();
  });

  it("should be defined", () => {
    class Test {
      @PrimaryUlidColumn()
      public test1!: string;

      @UlidColumn()
      public test2!: string;
    }

    expect(new Test()).toBeDefined();
  });
});
