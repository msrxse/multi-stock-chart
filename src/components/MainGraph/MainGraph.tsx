import { useEffect, useState } from 'react';
import moment from 'moment';
import { extent } from 'd3-array';
import GraphContainer from './Graph/GraphContainer';
import Brush from './Graph/Brush';
import Legend from './Graph/Legend';
import { margin } from './utils/margin';
import { getActiveSeriesIds, getFilteredActiveSeries, closestDateFound, filterByDate } from './utils/utils';
import { DateRange, Series, Instrument, MainGraphInitializeProps } from './utils/types';
import { useAppChartContext } from './hooks/useAppContext';

import styles from './MainGraph.module.css';

function MainGraph() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [dates, setDates] = useState<number[]>([]);
  const [seriesListForBrush, setSeriesListForBrush] = useState<Series[]>([]);
  const [animateTransition, setAnimateTransition] = useState(true);
  const [selectedSeriesIds, setSelectedSeriesIds] = useState<Map<string, boolean>>(new Map());
  const [currentHoveredSerieIndex, setCurrentHoveredSerieIndex] = useState(-1);

  const { companyId, width, height, dataset, optionsInstruments, handleSelectSeries } = useAppChartContext();

  /**
   * initialize() trigged on mount and dataset change
   * 1. Grab the series with its id
   * 2. Define brush initial filter range
   * 3. Only show active series
   */
  const initialize = ({ dates, series }: MainGraphInitializeProps) => {
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

    setSelectedSeriesIds(new Map(newSelectedSeriesIds as [string, boolean][]));
    setDataLoaded(true);
  };

  useEffect(() => {
    initialize(dataset);
  }, []);

  /**
   * keeps record of currently hovered serie
   * Must be the index of the currently selected series (not just all series)
   * Given trancheId returns the position on that series in seriesList
   */
  const getCurrentHoveredSerieIndex = (trancheId: string | -1) => {
    if (trancheId === -1) {
      return setCurrentHoveredSerieIndex(-1);
    }
    const hoveredIndex = seriesList.map((each) => each.key).indexOf(trancheId);
    return setCurrentHoveredSerieIndex(hoveredIndex);
  };

  /**
   *
   * @param {[ { key:0, values:[] }, ...{}, ]} seriesList
   * @param {[ date, date ]} dateRange
   */
  const update = (seriesList: Series[], dateRange: DateRange) => {
    if (dateRange) {
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
      setDateRange([selectionStartDate, selectionEndDate]);
      setSelectedDates(Array.from(newSelectedDates));
    }
  };

  /**
   * When selecting an instrument form legend
   * Remove or add the clicked tranche_Id from/to selection
   *  1. If add also do fetch
   *  2. If remove do remove from selection
   *
   */
  const onHandleSelectSeries = (instrument: Instrument) => {
    const { trancheId } = instrument;
    const newSelection = new Map(selectedSeriesIds);

    // if value is there - toggle it , otherwise set it as true
    newSelection.set(trancheId, !newSelection.get(trancheId));
    // filter active trancheIds and pick those series
    const activeSeriesIds = new Map([...newSelection].filter(([, value]) => value === true));
    const filteredActiveSeries = getFilteredActiveSeries(dataset.series, activeSeriesIds);

    setSelectedSeriesIds(newSelection);
    setAnimateTransition(true);

    return selectedSeriesIds.has(trancheId) ? update(filteredActiveSeries, dateRange) : handleSelectSeries(instrument);
  };

  const handleBrushRange = (dateRange: DateRange) => {
    if (dateRange) {
      // need dateRange as Unix Time in milliseconds (not an actual date)
      const selectionStartDate = moment(dateRange[0]).valueOf();
      const selectionEndDate = moment(dateRange[1]).valueOf();

      setDateRange([selectionStartDate, selectionEndDate]);
      setAnimateTransition(false);

      update(seriesListForBrush, dateRange);
    }
  };

  const handleBrushStart = () => {
    return null;
    // setAnimateTransition(false);
  };

  const handleBrushEnd = () => {
    return null;
    // setAnimateTransition(false);
  };

  return (
    <div className={styles.mainGraph}>
      {dataLoaded && (
        <>
          <GraphContainer
            width={width}
            height={height - 80}
            companyId={companyId}
            selectedDates={selectedDates}
            seriesList={seriesList}
            animateTransition={animateTransition}
            currentHoveredSerieIndex={currentHoveredSerieIndex}
          />
          <Brush
            width={width}
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
            width={width}
            height={120} // see css to change height
            optionsInstruments={Object.values(optionsInstruments)}
            handleSelectSeries={onHandleSelectSeries}
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
