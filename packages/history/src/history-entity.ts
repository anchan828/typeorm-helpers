import { Column, ColumnOptions } from "typeorm";
import { TYPEORM_HELPER_HISTORY_ACTION_TYPE, TYPEORM_HELPER_HISTORY_ORIGINAL_ID } from "./constants";
import { HistoryActionType } from "./history-action.enum";

export function HistoryActionColumn(column?: ColumnOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(TYPEORM_HELPER_HISTORY_ACTION_TYPE, propertyKey, target);

    const options: ColumnOptions = {
      default: HistoryActionType.CREATED,
      type: "enum",
      ...column,
    };

    if (options.type === "enum" && !options.enum) {
      options.enum = Object.values(HistoryActionType);
    }

    Column(options)(target, propertyKey);
  };
}

export function HistoryOriginalIdColumn(column?: ColumnOptions): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(TYPEORM_HELPER_HISTORY_ORIGINAL_ID, propertyKey, target);
    Column({ ...column })(target, propertyKey);
  };
}

export interface HistoryEntityInterface {
  id: number | string;
  originalID: number | string;

  action: HistoryActionType;
}
