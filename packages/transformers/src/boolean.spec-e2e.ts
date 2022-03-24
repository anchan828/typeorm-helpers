import { e2eDatabaseTypeSetUp, e2eSetUp } from "testing";
import { BaseEntity, Column, DataSource, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BooleanTransformer } from "./boolean";
e2eDatabaseTypeSetUp("BooleanTransformer", (options) => {
  @Entity()
  class BooleanTransformerTest extends BaseEntity {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({
      nullable: true,
      transformer: new BooleanTransformer(),
      type: "int",
      width: 1,
    })
    public bool!: boolean;
  }

  let dataSource: DataSource;

  e2eSetUp({ entities: [BooleanTransformerTest], ...options }, (source) => {
    dataSource = source;
  });

  it("should return undefined", async () => {
    const test = await BooleanTransformerTest.create({}).save();

    expect(await BooleanTransformerTest.findOneBy({ id: test.id })).toEqual({
      bool: undefined,
      id: 1,
    });
  });
  it("should return true", async () => {
    const test = await BooleanTransformerTest.create({
      bool: true,
    }).save();

    expect(await BooleanTransformerTest.findOneBy({ id: test.id })).toEqual({
      bool: true,
      id: 1,
    });

    const rawQuery = await dataSource
      .createQueryBuilder(BooleanTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();

    expect(rawQuery).toEqual({ entity_bool: 1, entity_id: 1 });
  });

  it("should return false", async () => {
    const test = await BooleanTransformerTest.create({
      bool: false,
    }).save();

    expect(await BooleanTransformerTest.findOneBy({ id: test.id })).toEqual({
      bool: false,
      id: 1,
    });

    const rawQuery = await dataSource
      .createQueryBuilder(BooleanTransformerTest, "entity")
      .whereInIds(test.id)
      .getRawOne();

    expect(rawQuery).toEqual({ entity_bool: 0, entity_id: 1 });
  });
});
