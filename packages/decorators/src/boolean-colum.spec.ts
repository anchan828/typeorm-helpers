import { BooleanColumn } from './boolean-column';

describe('BooleanColumn', () => {
  it('should be defined', () => {
    expect(BooleanColumn).toBeDefined();
  });

  it('should be defined', () => {
    class Test {
      @BooleanColumn({ default: false })
      public test!: boolean;

      @BooleanColumn()
      public test2!: boolean;
    }
    expect(new Test()).toBeDefined();
  });
});
