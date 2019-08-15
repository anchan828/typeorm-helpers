import { UlidColumn } from "./ulid-column";

describe("UlidColumn", () => {
  it("should be defined", () => {
    expect(UlidColumn).toBeDefined();
  });

  it("should be defined", () => {
    class Test {
      @UlidColumn()
      public test!: string;
    }

    expect(new Test()).toBeDefined();
  });
});
