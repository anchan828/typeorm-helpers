import { JsonColumn } from "./json-column";

interface TestInterface {
  hoge: string;
  foo: number;
}

describe("JsonColumn", () => {
  it("should be defined", () => {
    expect(JsonColumn).toBeDefined();
  });

  it("should be defined", () => {
    class Test {
      @JsonColumn<string[]>({ default: [] })
      public test!: string[];

      @JsonColumn<TestInterface>()
      public test2!: TestInterface;
    }
    expect(new Test()).toBeDefined();
  });
});
