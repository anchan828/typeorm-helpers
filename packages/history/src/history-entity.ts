import { Column } from "typeorm";
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
