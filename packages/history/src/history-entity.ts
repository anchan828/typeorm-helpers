import {
  Column,
  EntityManager,
  EntityMetadata,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from "typeorm";
import { HistoryActionType } from "./history-action.enum";

export function HistoryActionColumn(): Function {
  return Column({
    default: HistoryActionType.CREATED,
    enum: Object.values(HistoryActionType),
    type: "enum",
  });
}
export interface HistoryEntityInterface {
  id: number | string;
  originalID: number | string;

  action: HistoryActionType;
}
export interface HistoryEntitySubscriberInterface<EntityType, HistoryEntityType>
  extends EntitySubscriberInterface<EntityType> {
  entity: Function;
  historyEntity: Function;
  createHistoryEntity(manager: EntityManager, entity: EntityType): HistoryEntityType | Promise<HistoryEntityType>;

  beforeInsertHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType>;
  afterInsertHistory(history: HistoryEntityType): void | Promise<void>;
  beforeUpdateHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType>;
  afterUpdateHistory(history: HistoryEntityType): void | Promise<void>;
  beforeRemoveHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType>;
  afterRemoveHistory(history: HistoryEntityType): void | Promise<void>;
}
export abstract class HistoryEntitySubscriber<EntityType, HistoryEntityType extends HistoryEntityInterface & EntityType>
  implements HistoryEntitySubscriberInterface<EntityType, HistoryEntityType>
{
  public beforeInsertHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public afterInsertHistory(history: HistoryEntityType): void | Promise<void> {}
  public beforeUpdateHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public afterUpdateHistory(history: HistoryEntityType): void | Promise<void> {}
  public beforeRemoveHistory(history: HistoryEntityType): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  public afterRemoveHistory(history: HistoryEntityType): void | Promise<void> {}

  public abstract get entity(): Function;
  public abstract get historyEntity(): Function;

  public listenTo(): Function {
    return this.entity;
  }
  public createHistoryEntity(
    manager: Readonly<EntityManager>,
    entity: EntityType,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return manager.create(this.historyEntity, entity);
  }

  public async afterInsert(event: InsertEvent<EntityType>): Promise<void> {
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeInsertHistory,
      this.afterInsertHistory,
      HistoryActionType.CREATED,
      event.entity,
    );
  }

  public async afterUpdate(event: UpdateEvent<EntityType>): Promise<void> {
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeUpdateHistory,
      this.afterUpdateHistory,
      HistoryActionType.UPDATED,
      event.entity,
    );
  }

  public async beforeRemove(event: RemoveEvent<EntityType>): Promise<void> {
    await this.createHistory(
      event.manager,
      event.metadata,
      this.beforeRemoveHistory,
      this.afterRemoveHistory,
      HistoryActionType.DELETED,
      event.entity,
    );
  }

  private async createHistory(
    manager: Readonly<EntityManager>,
    metadata: Readonly<EntityMetadata>,
    beforeHistoryFunction: (history: HistoryEntityType) => HistoryEntityType | Promise<HistoryEntityType>,
    afterHistoryFunction: (history: HistoryEntityType) => void | Promise<void>,
    action: Readonly<HistoryActionType>,
    entity?: EntityType,
  ): Promise<void> {
    if (!entity || Object.keys(metadata.propertiesMap).includes("action")) {
      return;
    }

    const history = await this.createHistoryEntity(manager, entity);
    history.action = action;

    for (const primaryColumn of metadata.primaryColumns) {
      history.originalID = Reflect.get(history, primaryColumn.propertyName);
      Reflect.deleteProperty(history, primaryColumn.propertyName);
    }

    await beforeHistoryFunction(history);
    await manager.save(history);
    await afterHistoryFunction(history);
  }
}
