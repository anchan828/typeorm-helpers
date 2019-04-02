import { BooleanTransformer } from './boolean';

describe('BooleanTransformer', () => {
  const booleanTransformer = new BooleanTransformer();

  it('should be defined', () => {
    expect(booleanTransformer).toBeDefined();
  });

  describe('from', () => {
    it('should return undefined', () => {
      expect(booleanTransformer.from(null)).toBeUndefined();
    });
    it('should return undefined', () => {
      expect(booleanTransformer.from(undefined)).toBeUndefined();
    });

    it('should return false', () => {
      expect(booleanTransformer.from(0)).toBeFalsy();
    });

    it('should return true', () => {
      expect(booleanTransformer.from(1)).toBeTruthy();
      expect(booleanTransformer.from(10)).toBeTruthy();
    });
  });

  describe('to', () => {
    it('should return undefined', () => {
      expect(booleanTransformer.to(null)).toBeUndefined();
    });
    it('should return undefined', () => {
      expect(booleanTransformer.to(undefined)).toBeUndefined();
    });

    it('should return false', () => {
      expect(booleanTransformer.to(false)).toBe(0);
    });

    it('should return true', () => {
      expect(booleanTransformer.to(true)).toBe(1);
    });
  });
});
