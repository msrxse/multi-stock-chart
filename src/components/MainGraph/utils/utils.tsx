/**
 * Filters passed map of tranceIds where its value is true
 * @param {new Map()} newSelection
 */
const getActiveSeriesIds = (newSelection) =>
  new Map([...newSelection].filter(([key, value]) => value === true));
/**
 * Filters from series the trancheIds series contained in the activeSeriesIds
 * @param {key:"", values:[]} series
 * @param {new Map()} activeSeriesIds
 */
const getFilteredActiveSeries = (series, activeSeriesIds) =>
  series.filter((each) =>
    Array.from(activeSeriesIds.keys()).includes(each.key)
  );
/**
 *
 * @param {*} array
 * @param {*} date
 */
const closestDateFound = (array, date) => {
  return array.reduce((prev, curr) => {
    return Math.abs(curr - date) < Math.abs(prev - date) ? curr : prev;
  }, []);
};
/**
 *
 * @param {*} series
 * @param {*} idxMin
 * @param {*} idxMax
 */
const filterByDate = (series, idxMin, idxMax) => {
  const filteredSeries = series.map((s) => {
    const newS = { ...s };

    newS.values = s.values.slice(idxMin, idxMax);

    return newS;
  });

  return filteredSeries;
};

export {
  getActiveSeriesIds,
  getFilteredActiveSeries,
  closestDateFound,
  filterByDate,
};
