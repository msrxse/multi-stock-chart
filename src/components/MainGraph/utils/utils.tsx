import { SelectedSeriesIds, Series } from '../utils/types';

type NewSelection = [string, boolean][] | SelectedSeriesIds;
/**
 * Filters passed map of tranceIds where its value is true
 * @param {newSelection} array of trancheId, boolean (nor a Map!!)
 */
const getActiveSeriesIds = (newSelection: NewSelection): SelectedSeriesIds =>
  new Map([...newSelection].filter(([_, value]) => value === true));
/**
 * Filters from series the trancheIds series contained in the activeSeriesIds
 * @param {key: "", values:[]} series
 * @param {new Map()} activeSeriesIds
 */
const getFilteredActiveSeries = (series: Series[], activeSeriesIds: SelectedSeriesIds): Series[] =>
  series.filter((each) => Array.from(activeSeriesIds.keys()).includes(each.key));
/**
 * Retrieves closes existing date
 * @param {*} array of dates (UNIX time)
 * @param {*} date to search from
 */
const closestDateFound = (array: number[], date: number): number => {
  return array.reduce<number>((prev, curr) => {
    return Math.abs(curr - date) < Math.abs(prev - date) ? curr : prev;
  }, 0);
};
/**
 *Returns values filtered by given dates
 * @param {*} series
 * @param {*} idxMin
 * @param {*} idxMax
 */
const filterByDate = (series: Series[], idxMin: number, idxMax: number): Series[] => {
  const filteredSeries = series.map((s) => {
    const newS = { ...s };

    newS.values = s.values.slice(idxMin, idxMax);

    return newS;
  });

  return filteredSeries;
};

export { getActiveSeriesIds, getFilteredActiveSeries, closestDateFound, filterByDate };
