export type Period = {
  start: Date;
  end: Date;
};

export type Planning = Array<Period>;

export class PERIOD_WRAP_ANOTHER_PERIOD_ERROR extends Error {
  constructor() {
    super("PERIOD_WRAP_ANOTHER_PERIOD_ERROR");
  }
}

export class PERIOD_WITHIN_ANOTHER_PERIOD_ERROR extends Error {
  constructor() {
    super("PERIOD_WITHIN_ANOTHER_PERIOD_ERROR");
  }
}

function addDaysToDate(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function areDateEqual(d1: Date, d2: Date) {
  return d1.toISOString().split("T")[0] === d2.toISOString().split("T")[0];
}

/**
 * find the closest perdiod that start before the newPeriod
 */
function findPreviousPeriod(newPeriod: Period, planning: Planning) {
  return planning.reduce<Period | undefined>((acc, curr) => {
    if (curr.start > newPeriod.start) return acc;

    if (!acc) return curr;

    if (curr.start > acc.start) return curr;
    return acc;
  }, undefined);
}

/**
 * find the closest perdiod that start after the newPeriod
 */
function findNextPeriod(newPeriod: Period, planning: Planning) {
  return planning.reduce<Period | undefined>((acc, curr) => {
    if (curr.start < newPeriod.start) {
      return acc;
    }

    if (!acc) {
      return curr;
    }

    if (curr.start < acc.start) {
      return curr;
    }
    return acc;
  }, undefined);
}

/**
 * find the next period from a given period that are following each other,
 * meaning the periods have only 1 day of interval between them
 */
function findNextFollowedPeriod(period: Period, planning: Planning) {
  const nextPeriodStart = addDaysToDate(period.end, 1);

  return planning.find((per) => areDateEqual(per.start, nextPeriodStart));
}

function updatePeriods(newPeriod: Period, planning: Planning) {
  const previousPeriod = findPreviousPeriod(newPeriod, planning);

  if (previousPeriod) {
    if (newPeriod.end < previousPeriod.end)
      throw new PERIOD_WITHIN_ANOTHER_PERIOD_ERROR();

    const nextPeriodOfPreviousPeriod = findNextFollowedPeriod(
      previousPeriod,
      planning
    );

    if (!nextPeriodOfPreviousPeriod) {
      // overlapping with previous period
      previousPeriod.end = addDaysToDate(newPeriod.start, -1);
      return;
    }

    if (newPeriod.end > nextPeriodOfPreviousPeriod.end)
      throw new PERIOD_WRAP_ANOTHER_PERIOD_ERROR();

    // We got overlapping in the previous period and the next period
    previousPeriod.end = addDaysToDate(newPeriod.start, -1);
    nextPeriodOfPreviousPeriod.start = addDaysToDate(newPeriod.end, 1);
    return;
  }

  const nextPeriod = findNextPeriod(newPeriod, planning);

  // we have nor previous or next period, meaning the planning is empty
  if (!nextPeriod) return;

  if (newPeriod.end > nextPeriod.end)
    throw new PERIOD_WRAP_ANOTHER_PERIOD_ERROR();

  nextPeriod.start = addDaysToDate(newPeriod.end, 1);

  return true;
}

export function addNewPeriodToPlanning(newPeriod: Period, planning: Planning) {
  updatePeriods(newPeriod, planning);
  planning.push(newPeriod);
}
