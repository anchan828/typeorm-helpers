/* eslint-disable @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
import {
  EntityManager,
  EntityMetadata,
  EntitySubscriberInterface,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from "typeorm";
import { TYPEORM_HELPER_HISTORY_ACTION_TYPE, TYPEORM_HELPER_HISTORY_ORIGINAL_ID } from "./constants";
import { HistoryActionType } from "./history-action.enum";

export interface HistoryEntitySubscriberInterface<EntityType, HistoryEntityType>
  extends EntitySubscriberInterface<EntityType> {
  entity: Function;
  historyEntity: Function;
  createHistoryEntity(manager: EntityManager, entity: EntityType): HistoryEntityType | Promise<HistoryEntityType>;

  beforeInsertHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType>;
  afterInsertHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void>;
  beforeUpdateHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType>;
  afterUpdateHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void>;
  beforeRemoveHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType>;
  afterRemoveHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void>;
}
export abstract class HistoryEntitySubscriber<EntityType, HistoryEntityType>
  implements HistoryEntitySubscriberInterface<EntityType, HistoryEntityType>
{
  public beforeInsertHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterInsertHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}

  public beforeUpdateHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }
  public afterUpdateHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}

  public beforeRemoveHistory(
    history: HistoryEntityType,
    entity: Readonly<EntityType>,
  ): HistoryEntityType | Promise<HistoryEntityType> {
    return history;
  }

  public afterRemoveHistory(history: HistoryEntityType, entity: Readonly<EntityType>): void | Promise<void> {}

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
      event.entity as EntityType | undefined,
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
    beforeHistoryFunction: (
      history: HistoryEntityType,
      entity: Readonly<EntityType>,
    ) => HistoryEntityType | Promise<HistoryEntityType>,
    afterHistoryFunction: (history: HistoryEntityType, entity: Readonly<EntityType>) => void | Promise<void>,
    action: Readonly<HistoryActionType>,
    entity?: EntityType,
  ): Promise<void> {
    if (!entity) {
      return;
    }

    const hasActionColumn = Reflect.hasMetadata(TYPEORM_HELPER_HISTORY_ACTION_TYPE, entity);

    if (!entity || hasActionColumn) {
      return;
    }

    const history = (await this.createHistoryEntity(manager, entity)) as HistoryEntityType & { originalID?: number };

    const actionPropertyName = Reflect.getMetadata(TYPEORM_HELPER_HISTORY_ACTION_TYPE, history);

    if (!actionPropertyName) {
      throw new Error(`${this.historyEntity.name} does not have @HistoryActionColumn defined.`);
    }

    Reflect.set(history, actionPropertyName, action);

    let originalIdPropertyName = Reflect.getMetadata(TYPEORM_HELPER_HISTORY_ORIGINAL_ID, history);

    {
      // for backward compatibility
      if (!originalIdPropertyName) {
        if (metadata.propertiesMap["originalID"]) {
          throw new Error(
            `The originalID has already been defined for ${this.entity.name}. An entity cannot have a property with the same name.`,
          );
        }

        const historyMetadata = manager.connection.getMetadata(this.historyEntity);

        if (historyMetadata?.propertiesMap["originalID"]) {
          originalIdPropertyName = "originalID";
        }
      }
    }

    if (!originalIdPropertyName) {
      throw new Error(`${this.historyEntity.name} does not have @HistoryOriginalIdColumn defined.`);
    }

    for (const primaryColumn of metadata.primaryColumns) {
      const originalID = Reflect.get(history, primaryColumn.propertyName);
      Reflect.set(history, originalIdPropertyName, originalID);
      Reflect.deleteProperty(history, primaryColumn.propertyName);
    }

    await beforeHistoryFunction(history, entity);
    await manager.save(history);
    await afterHistoryFunction(history, entity);
  }
}
