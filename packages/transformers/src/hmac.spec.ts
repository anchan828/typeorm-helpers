import { HmacTransformer } from './hmac';

describe('HmacTransformer', () => {
  const hmacTransformer = new HmacTransformer();

  it('should be defined', () => {
    expect(hmacTransformer).toBeDefined();
  });

  describe('to', () => {
    it('should return undefined', () => {
      expect(hmacTransformer.to(null)).toBeUndefined();
    });
    it('should return undefined', () => {
      expect(hmacTransformer.to(undefined)).toBeUndefined();
    });

    it('should return hash', () => {
      expect(hmacTransformer.to('test')).toBe(
        '88cd2108b5347d973cf39cdf9053d7dd42704876d8c9a9bd8e2d168259d3ddf7',
      );
    });

    it('should return hash by key', () => {
      expect(new HmacTransformer({ key: 'key' }).to('test')).toBe(
        '02afb56304902c656fcb737cdd03de6205bb6d401da2812efd9b2d36a08af159',
      );
    });
  });

  describe('from', () => {
    it('should return undefined', () => {
      expect(hmacTransformer.from(null)).toBeUndefined();
    });
    it('should return undefined', () => {
      expect(hmacTransformer.from(undefined)).toBeUndefined();
    });

    it('should return same value', () => {
      expect(hmacTransformer.from('test')).toBe('test');
    });
  });
});
