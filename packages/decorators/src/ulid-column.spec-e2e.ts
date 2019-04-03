import {
  BaseEntity,
  Entity,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { createTestConnection } from './test-utils';
import { UlidColumn } from './ulid-column';

describe('UlidColumn', () => {
  @Entity()
  class UlidColumnMonotonicTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @UlidColumn()
    public text!: string;
  }

  @Entity()
  class UlidColumnNotMonotonicTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @UlidColumn({ isMonotonic: false })
    public text!: string;
  }

  beforeEach(async () => {
    await createTestConnection([
      UlidColumnMonotonicTest,
      UlidColumnNotMonotonicTest,
    ]);
  });
  afterEach(() => getConnection().close());

  it('should be defined', async () => {
    await UlidColumnMonotonicTest.create().save();
    await UlidColumnNotMonotonicTest.create().save();
  });
});
