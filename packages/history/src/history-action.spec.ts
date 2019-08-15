import { HistoryActionType } from "./history-action.enum";

describe("HistoryAction", () => {
  it("should get history action names", () => {
    expect(Object.values(HistoryActionType)).toStrictEqual([
      HistoryActionType.CREATED,
      HistoryActionType.UPDATED,
      HistoryActionType.DELETED,
    ]);
  });
});
