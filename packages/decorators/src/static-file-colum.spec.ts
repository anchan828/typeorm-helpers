import { BinaryLike } from 'crypto';
import { tmpdir } from 'os';
import { StaticFileColumn } from './static-file-column';

describe('StaticFileColumn', () => {
  it('should be defined', () => {
    expect(StaticFileColumn).toBeDefined();
  });

  it('should be defined', () => {
    class Test {
      @StaticFileColumn({ dirname: tmpdir() })
      public test!: BinaryLike;
    }
    expect(new Test()).toBeDefined();
  });
});
