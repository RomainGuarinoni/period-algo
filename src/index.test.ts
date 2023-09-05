import {
  PERIOD_WITHIN_ANOTHER_PERIOD_ERROR,
  PERIOD_WRAP_ANOTHER_PERIOD_ERROR,
  Period,
  addNewPeriodToPlanning,
} from ".";

// HELPERS
function addDaysToDate(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// CONSTANTS
const FIRST_DATE: Period = {
  start: new Date("2020-10-10T08:00:00.000Z"),
  end: new Date("2020-10-15T08:00:00.000Z"),
} as const;
const SECOND_DATE: Period = {
  start: new Date("2020-10-16T08:00:00.000Z"),
  end: new Date("2020-10-19T08:00:00.000Z"),
} as const;
const THIRD_DATE: Period = {
  start: new Date("2020-10-20T08:00:00.000Z"),
  end: new Date("2020-10-26T09:00:00.000Z"),
} as const;
const PERIOD_OFFSET = 2;

// TESTS
describe("addNewPeriodToPlanning", () => {
  let firstDate: Period, secondDate: Period, thirdDate: Period;

  beforeEach(() => {
    firstDate = { ...FIRST_DATE };
    secondDate = { ...SECOND_DATE };
    thirdDate = { ...THIRD_DATE };
  });

  test("insert a new period at the start of the planning", () => {
    const startOffest = PERIOD_OFFSET + 3;
    const endOffest = PERIOD_OFFSET;

    const newPeriod: Period = {
      start: addDaysToDate(FIRST_DATE.start, -startOffest),
      end: addDaysToDate(FIRST_DATE.start, -endOffest),
    };

    const planning = [firstDate, secondDate, thirdDate];

    addNewPeriodToPlanning(newPeriod, planning);

    expect(newPeriod).toStrictEqual<Period>({
      start: addDaysToDate(FIRST_DATE.start, -startOffest),
      end: addDaysToDate(FIRST_DATE.start, -endOffest),
    });

    expect(firstDate).toStrictEqual({
      start: addDaysToDate(FIRST_DATE.start, -(endOffest - 1)),
      end: FIRST_DATE.end,
    });
    expect(planning.length).toEqual(4);
  });

  test("insert a new period at the end of the planning", () => {
    const startOffest = PERIOD_OFFSET;
    const endOffest = PERIOD_OFFSET + 3;

    const newPeriod: Period = {
      start: addDaysToDate(THIRD_DATE.end, startOffest),
      end: addDaysToDate(THIRD_DATE.end, endOffest),
    };

    const planning = [firstDate, secondDate, thirdDate];

    addNewPeriodToPlanning(newPeriod, planning);

    expect(newPeriod).toStrictEqual<Period>({
      start: addDaysToDate(THIRD_DATE.end, startOffest),
      end: addDaysToDate(THIRD_DATE.end, endOffest),
    });

    expect(thirdDate).toStrictEqual({
      start: THIRD_DATE.start,
      end: addDaysToDate(newPeriod.start, -1),
    });
    expect(planning.length).toEqual(4);
  });

  test("insert a new period at the start of the planning overlapping the start of the first period", () => {
    const newPeriod: Period = {
      start: addDaysToDate(FIRST_DATE.start, -PERIOD_OFFSET),
      end: addDaysToDate(FIRST_DATE.start, PERIOD_OFFSET),
    };

    const planning = [firstDate, secondDate, thirdDate];

    addNewPeriodToPlanning(newPeriod, planning);

    expect(newPeriod).toStrictEqual<Period>({
      start: addDaysToDate(FIRST_DATE.start, -PERIOD_OFFSET),
      end: addDaysToDate(FIRST_DATE.start, PERIOD_OFFSET),
    });

    expect(firstDate).toStrictEqual({
      start: addDaysToDate(FIRST_DATE.start, PERIOD_OFFSET + 1),
      end: FIRST_DATE.end,
    });
    expect(planning.length).toEqual(4);
  });

  test("insert a new period at the end of the planning overlapping the end of the last period", () => {
    const newPeriod: Period = {
      start: addDaysToDate(THIRD_DATE.end, -PERIOD_OFFSET),
      end: addDaysToDate(THIRD_DATE.end, PERIOD_OFFSET),
    };

    const planning = [firstDate, secondDate, thirdDate];

    addNewPeriodToPlanning(newPeriod, planning);

    expect(newPeriod).toStrictEqual<Period>({
      start: addDaysToDate(THIRD_DATE.end, -PERIOD_OFFSET),
      end: addDaysToDate(THIRD_DATE.end, PERIOD_OFFSET),
    });

    expect(thirdDate).toStrictEqual({
      start: THIRD_DATE.start,
      end: addDaysToDate(THIRD_DATE.end, -(PERIOD_OFFSET + 1)),
    });
    expect(planning.length).toEqual(4);
  });

  test("insert a new period at the middle of the planning overlapping two different period", () => {
    const newPeriod: Period = {
      start: addDaysToDate(SECOND_DATE.end, -PERIOD_OFFSET),
      end: addDaysToDate(THIRD_DATE.start, PERIOD_OFFSET),
    };

    const planning = [firstDate, secondDate, thirdDate];

    addNewPeriodToPlanning(newPeriod, planning);

    expect(newPeriod).toStrictEqual<Period>({
      start: addDaysToDate(SECOND_DATE.end, -PERIOD_OFFSET),
      end: addDaysToDate(THIRD_DATE.start, PERIOD_OFFSET),
    });

    expect(secondDate).toStrictEqual({
      start: SECOND_DATE.start,
      end: addDaysToDate(SECOND_DATE.end, -(PERIOD_OFFSET + 1)),
    });

    expect(thirdDate).toStrictEqual({
      start: addDaysToDate(THIRD_DATE.start, PERIOD_OFFSET + 1),
      end: THIRD_DATE.end,
    });
    expect(planning.length).toEqual(4);
  });

  test("throw an error because the new period wrap an existing period", () => {
    const newPeriod: Period = {
      start: addDaysToDate(SECOND_DATE.start, -PERIOD_OFFSET),
      end: addDaysToDate(SECOND_DATE.end, PERIOD_OFFSET),
    };

    const planning = [firstDate, secondDate, thirdDate];

    expect(() => addNewPeriodToPlanning(newPeriod, planning)).toThrow(
      PERIOD_WRAP_ANOTHER_PERIOD_ERROR
    );
    expect(planning.length).toEqual(3);
  });

  test("throw an error because the new period is within an existing period", () => {
    const newPeriod: Period = {
      start: addDaysToDate(THIRD_DATE.start, PERIOD_OFFSET),
      end: addDaysToDate(THIRD_DATE.end, -PERIOD_OFFSET),
    };

    const planning = [firstDate, secondDate, thirdDate];

    expect(() => addNewPeriodToPlanning(newPeriod, planning)).toThrow(
      PERIOD_WITHIN_ANOTHER_PERIOD_ERROR
    );
    expect(planning.length).toEqual(3);
  });
});
