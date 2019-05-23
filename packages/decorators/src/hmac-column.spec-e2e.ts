import {
  BaseEntity,
  Entity,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HmacColumn } from './hmac-column';
import { createTestConnection } from './test-utils';
describe('HmacColumn', () => {
  @Entity()
  class HmacTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @HmacColumn()
    public password!: string;

    @HmacColumn({ algorithm: 'sha512', key: 'key' })
    public password2!: string;
  }

  beforeEach(async () => {
    await createTestConnection([HmacTransformerTest]);
  });

  it('should return hash', async () => {
    const test = await HmacTransformerTest.create({
      password: 'test',
      password2: 'test',
    }).save();

    await expect(HmacTransformerTest.findOne(test.id)).resolves.toEqual({
      id: 1,
    });
    await expect(
      HmacTransformerTest.findOne(test.id, {
        select: ['password', 'password2'],
      }),
    ).resolves.toEqual({
      password:
        '88cd2108b5347d973cf39cdf9053d7dd42704876d8c9a9bd8e2d168259d3ddf7',
      password2:
        '287a0fb89a7fbdfa5b5538636918e537a5b83065e4ff331268b7aaa115dde047a9b0f4fb5b828608fc0b6327f10055f7637b058e9e0dbb9e698901a3e6dd461c',
    });
  });

  it('should find entity by password', async () => {
    const test = await HmacTransformerTest.create({
      password: 'test',
      password2: 'test',
    }).save();

    await expect(
      HmacTransformerTest.findOne({ where: { password: 'test' } }),
    ).resolves.toEqual({
      id: 1,
    });
  });

  afterEach(() => getConnection().close());
});
