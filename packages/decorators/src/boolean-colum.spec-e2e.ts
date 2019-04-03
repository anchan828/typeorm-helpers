import {
  BaseEntity,
  Entity,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BooleanColumn } from './boolean-column';
import { createTestConnection } from './test-utils';

describe('BooleanColumn', () => {
  @Entity()
  class BooleanColumnTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @BooleanColumn({ default: false })
    public test!: boolean;
  }

  beforeEach(async () => {
    await createTestConnection([BooleanColumnTest]);
  });
  afterEach(() => getConnection().close());

  it('should be defined', async () => {
    await BooleanColumnTest.create({ test: true }).save();
  });
});
