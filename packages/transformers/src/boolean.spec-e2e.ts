import {
  BaseEntity,
  Column,
  Entity,
  getConnection,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BooleanTransformer } from './boolean';
import { createTestConnection } from './test-utils';
describe('BigintTransformer', () => {
  @Entity()
  class BooleanTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      type: 'tinyint',
      width: 1,
      nullable: true,
      transformer: new BooleanTransformer(),
    })
    public bool!: boolean;
  }

  beforeEach(async () => {
    await createTestConnection([BooleanTransformerTest]);
  });
  it('should return undefined', async () => {
    const test = await BooleanTransformerTest.create({}).save();

    expect(await BooleanTransformerTest.findOne(test.id)).toEqual({
      id: 1,
      bool: undefined,
    });
  });
  it('should return true', async () => {
    const test = await BooleanTransformerTest.create({
      bool: true,
    }).save();

    expect(await BooleanTransformerTest.findOne(test.id)).toEqual({
      id: 1,
      bool: true,
    });

    const rawQuery = await getConnection().query(
      'SELECT * FROM `boolean_transformer_test` WHERE `id`=?',
      [test.id],
    );

    expect(rawQuery).toHaveLength(1);
    expect(rawQuery[0]).toHaveProperty('bool', 1);
  });

  it('should return false', async () => {
    const test = await BooleanTransformerTest.create({
      bool: false,
    }).save();

    expect(await BooleanTransformerTest.findOne(test.id)).toEqual({
      id: 1,
      bool: false,
    });

    const rawQuery = await getConnection().query(
      'SELECT * FROM `boolean_transformer_test` WHERE `id`=?',
      [test.id],
    );

    expect(rawQuery).toHaveLength(1);
    expect(rawQuery[0]).toHaveProperty('bool', 0);
  });

  afterEach(() => getConnection().close());
});
