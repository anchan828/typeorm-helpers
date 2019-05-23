import {
  BaseEntity,
  Column,
  Entity,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HmacTransformer } from './hmac';
import { createTestConnection } from './test-utils';
describe('HmacTransformer', () => {
  @Entity()
  class HmacTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new HmacTransformer(),
      type: 'varchar',
    })
    public password!: string;

    @Column({
      nullable: true,
      transformer: new HmacTransformer({ algorithm: 'sha512', key: 'key' }),
      type: 'varchar',
    })
    public password2!: string;
  }

  beforeEach(async () => {
    await createTestConnection([HmacTransformerTest]);
  });
  it('should return undefined', async () => {
    const test = await HmacTransformerTest.create({}).save();

    expect(await HmacTransformerTest.findOne(test.id)).toEqual({
      password: undefined,
      id: 1,
    });
  });
  it('should return hash', async () => {
    const test = await HmacTransformerTest.create({
      password: 'test',
      password2: 'test',
    }).save();

    expect(await HmacTransformerTest.findOne(test.id)).toEqual({
      password:
        '88cd2108b5347d973cf39cdf9053d7dd42704876d8c9a9bd8e2d168259d3ddf7',
      password2:
        '287a0fb89a7fbdfa5b5538636918e537a5b83065e4ff331268b7aaa115dde047a9b0f4fb5b828608fc0b6327f10055f7637b058e9e0dbb9e698901a3e6dd461c',
      id: 1,
    });
  });

  afterEach(() => getConnection().close());
});
