import { useEffect, useState } from 'react';
// import { utcParse, utcFormat } from 'd3-time-format';
// import { timeDay } from 'd3-time';
import moment from 'moment';
import { extent } from 'd3-array';
import GraphContainer from './GraphContainer';
import Brush from './Brush';
import Legend from './Legend';
import { margin } from '../utils/margin';
import { getActiveSeriesIds, getFilteredActiveSeries, closestDateFound, filterByDate } from '../utils/utils';
import { MainGraphProps } from '../utils/types';

import styles from '../allCss.module.css';

// const parseDate = utcParse('%Y-%m-%d');
// const formatDate = utcFormat('%Y-%m-%d');

function MainGraph(props: MainGraphProps) {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [dateRange, setDateRange] = useState([]);
  const [dates, setDates] = useState([]);
  const [seriesListForBrush, setSeriesListForBrush] = useState([]);
  const [animateTransition, setAnimateTransition] = useState(true);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState(new Map());
  const [currentHoveredSerieIndex, setCurrentHoveredSerieIndex] = useState(-1);

  useEffect(() => {
    initialize(props.dataset);
  }, []);

  useEffect(() => {
    initialize(props.dataset);
  }, [props.dataset.dates.length, props.dataset.series.length]);

  /**
   * keeps record of currently hovered serie
   * Must be the index of the currently selected series (not just all series)
   * Given trancheId returns the position on that series in seriesList
   */
  const getCurrentHoveredSerieIndex = (trancheId) => {
    const hoveredIndex = seriesList.map((each) => each.key).indexOf(trancheId);
    return setCurrentHoveredSerieIndex(hoveredIndex);
  };

  /**
   * initialize() trigged on mount and dataset change
   * 1. Grab the series with its id
   * 2. Define brush initial filter range
   * 3. Only show active series
   */
  const initialize = ({ dates, series }) => {
    if (dates.length === 0 || series.length === 0) {
      return undefined;
    }
    // last 3-month filtered by default
    const selectiondateBoundaries = extent(dates);
    const threeMonthsAgo = moment(selectiondateBoundaries[1]).subtract(3, 'months').valueOf();
    // closest date found in dates array
    const closestStartDateFound = closestDateFound(dates, threeMonthsAgo);
    const idxMin = dates.findIndex((x) => x === closestStartDateFound);
    // const idxMax = dates.findIndex((x) => x === selectiondateBoundaries[1]);
    const idxMax = dates.length;
    const newSelectedDates = Array.from(dates).slice(idxMin, idxMax);
    // Only show active series
    //   1. initial series always active
    //   2. any new one always active
    //   3. Any that the user hide leave it hidden
    const newSelectedSeriesIds = series.map((serie) => {
      if (selectedSeriesIds.has(serie.key)) {
        return [serie.key, selectedSeriesIds.get(serie.key)];
      }

      return [serie.key, true];
    });
    // filter active trancheIds and pick those series
    const activeSeriesIds = getActiveSeriesIds(newSelectedSeriesIds);
    const filteredActiveSeries = getFilteredActiveSeries(series, activeSeriesIds);
    // Filters series values array from startDate to endDate of the selection
    const dateRandeFilteredSeries = filterByDate(filteredActiveSeries, idxMin, idxMax);

    setSelectedDates(newSelectedDates);
    setDateRange([newSelectedDates[0], newSelectedDates[newSelectedDates.length - 1]]);
    setDates(Array.from(dates)); // dates for brush
    setSeriesList(dateRandeFilteredSeries);
    setSeriesListForBrush(Array.from(filteredActiveSeries));
    setSelectedSeriesIds(new Map(newSelectedSeriesIds));
    setDataLoaded(true);
  };

  /**
   *
   * @param {[ { key:0, values:[] }, ...{}, ]} seriesList
   * @param {[ date, date ]} dateRange
   */
  const update = (seriesList, dateRange) => {
    const selectionStartDate = moment(dateRange[0]).valueOf();
    const selectionEndDate = moment(dateRange[1]).valueOf();
    const closestStartDateFound = closestDateFound(dates, selectionStartDate);
    const closestEndDateFound = closestDateFound(dates, selectionEndDate);
    const idxMin = dates.findIndex((x) => x === closestStartDateFound);
    const idxMax = dates.findIndex((x) => x === closestEndDateFound);
    const newSelectedDates = Array.from(dates).slice(idxMin, idxMax);
    const filteredSeriesList = filterByDate(seriesList, idxMin, idxMax);

    setSeriesList(filteredSeriesList);
    setSeriesListForBrush(seriesList);
    setDateRange(dateRange);
    setSelectedDates(Array.from(newSelectedDates));
  };

  /**
   * When selecting an instrument form legend
   * Remove or add the clicked tranche_Id from/to selection
   *  1. If add also do fetch
   *  2. If remove do remove from selection
   *
   */
  const handleSelectSeries = (instrument) => {
    const { dataset } = props;
    const { trancheId } = instrument;
    const newSelection = new Map(selectedSeriesIds);

    // if value is there - toggle it , otherwise set it as true
    newSelection.set(trancheId, !newSelection.get(trancheId));
    // filter active trancheIds and pick those series
    const activeSeriesIds = new Map([...newSelection].filter(([key, value]) => value === true));
    const filteredActiveSeries = getFilteredActiveSeries(dataset.series, activeSeriesIds);

    setSelectedSeriesIds(newSelection);
    setAnimateTransition(true);

    return selectedSeriesIds.has(trancheId)
      ? update(filteredActiveSeries, dateRange)
      : props.handleSelectSeries({
          trancheId,
        });
  };

  const handleBrushRange = (dateRange) => {
    // need dateRange as Unix Time in milliseconds (not an actual date)
    const selectionStartDate = moment(dateRange[0]).valueOf();
    const selectionEndDate = moment(dateRange[1]).valueOf();

    setDateRange([selectionStartDate, selectionEndDate]);
    setAnimateTransition(false);

    update(seriesListForBrush, dateRange);
  };

  const handleBrushStart = () => {
    // setAnimateTransition(false);
  };

  const handleBrushEnd = () => {
    // setAnimateTransition(false);
  };

  // Legend will show only instruments under the selected metric
  const pickInstrumentsBySelectedMetric = () => {
    const { selectedMetric, options, optionsInstruments } = props;

    return options[selectedMetric.label].map((trancheId) => optionsInstruments[trancheId]);
  };

  return (
    <div className={styles.mainGraph}>
      {dataLoaded && (
        <>
          <GraphContainer
            width={props.width}
            height={props.height - 80}
            companyId={props.companyId}
            selectedDates={selectedDates}
            seriesList={seriesList}
            animateTransition={animateTransition}
            currentHoveredSerieIndex={currentHoveredSerieIndex}
          />
          <Brush
            width={props.width}
            height={80}
            series={seriesListForBrush}
            dates={dates}
            x={margin.yAxis}
            y={0}
            animateTransition={animateTransition}
            dateRange={dateRange}
            onBrushChange={handleBrushRange}
            onBrushStart={handleBrushStart}
            onBrushEnd={handleBrushEnd}
          />
          <Legend
            width={props.width}
            height={120} // see css to change height
            optionsInstruments={pickInstrumentsBySelectedMetric()}
            handleSelectSeries={handleSelectSeries}
            x={margin.yAxis}
            y={0}
            selectedSeriesIds={selectedSeriesIds}
            series={seriesListForBrush} // just for color[i]
            setCurrentHoveredSerieIndex={getCurrentHoveredSerieIndex} // keeps record of currently hovered serie
          />
        </>
      )}
    </div>
  );
}

export default MainGraph;
