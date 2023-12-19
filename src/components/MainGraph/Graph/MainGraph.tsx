import { Component } from 'react';
// import { utcParse, utcFormat } from 'd3-time-format';
// import { timeDay } from 'd3-time';
import moment from 'moment';
import { extent } from 'd3-array';
import GraphContainer from './GraphContainer';
import Brush from './Brush';
import Legend from './Legend';
import { margin } from '../utils/margin';
import { getActiveSeriesIds, getFilteredActiveSeries, closestDateFound, filterByDate } from '../utils/utils';

import styles from '../allCss.module.css';

// const parseDate = utcParse('%Y-%m-%d');
// const formatDate = utcFormat('%Y-%m-%d');

class MainGraph extends Component {
  state = {
    dataLoaded: false,
    seriesList: [],
    selectedDates: [], // selection of dates (from min to max dates)
    dateRange: [], // mix/max selected dates // Only used by Brush
    dates: [], // used by Brush, entire date selection
    seriesListForBrush: [], // used by Brush in handler
    animateTransition: true,
    selectedSeriesIds: new Map(), // list of selected TrancheIds (NOTE: not currently selected, previous selected appear with value false)
    currentHoveredSerieIndex: -1, // keeps record of currently hovered serie
  };

  componentDidMount() {
    this.initialize(this.props.dataset);
  }

  componentDidUpdate(prevProp) {
    if (
      this.props.dataset.dates.length !== prevProp.dataset.dates.length ||
      this.props.dataset.series.length !== prevProp.dataset.series.length
    ) {
      this.initialize(this.props.dataset);
    }
  }

  /**
   * keeps record of currently hovered serie
   * Must be the index of the currently selected series (not just all series)
   * Given trancheId returns the position on that series in seriesList
   */
  setCurrentHoveredSerieIndex = (trancheId) => {
    return this.setState((prevState) => {
      const hoveredIndex = prevState.seriesList.map((each) => each.key).indexOf(trancheId);

      return { currentHoveredSerieIndex: hoveredIndex };
    });
  };

  /**
   * initialize() trigged on mount and dataset change
   * 1. Grab the series with its id
   * 2. Define brush initial filter range
   * 3. Only show active series
   */
  initialize = ({ dates, series }) => {
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
    const { selectedSeriesIds } = this.state;
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

    return this.setState(
      {
        selectedDates: newSelectedDates,
        dateRange: [newSelectedDates[0], newSelectedDates[newSelectedDates.length - 1]],
        dates: Array.from(dates), // dates for brush
        seriesList: dateRandeFilteredSeries,
        seriesListForBrush: Array.from(filteredActiveSeries),
        selectedSeriesIds: new Map(newSelectedSeriesIds),
      },
      () => {
        this.setState({ dataLoaded: true });
      },
    );
  };

  /**
   *
   * @param {[ { key:0, values:[] }, ...{}, ]} seriesList
   * @param {[ date, date ]} dateRange
   */
  update = (seriesList, dateRange) => {
    const { dates } = this.state;
    const selectionStartDate = moment(dateRange[0]).valueOf();
    const selectionEndDate = moment(dateRange[1]).valueOf();
    const closestStartDateFound = closestDateFound(dates, selectionStartDate);
    const closestEndDateFound = closestDateFound(dates, selectionEndDate);
    const idxMin = dates.findIndex((x) => x === closestStartDateFound);
    const idxMax = dates.findIndex((x) => x === closestEndDateFound);
    const newSelectedDates = Array.from(dates).slice(idxMin, idxMax);
    const filteredSeriesList = filterByDate(seriesList, idxMin, idxMax);

    this.setState({
      seriesList: filteredSeriesList,
      seriesListForBrush: seriesList,
      dateRange,
      selectedDates: Array.from(newSelectedDates),
    });
  };

  /**
   * When selecting an instrument form legend
   * Remove or add the clicked tranche_Id from/to selection
   *  1. If add also do fetch
   *  2. If remove do remove from selection
   *
   */
  handleSelectSeries = (instrument) => {
    const { selectedSeriesIds, dateRange } = this.state;
    const { dataset } = this.props;
    const { trancheId } = instrument;
    const newSelection = new Map(selectedSeriesIds);

    // if value is there - toggle it , otherwise set it as true
    newSelection.set(trancheId, !newSelection.get(trancheId));
    // filter active trancheIds and pick those series
    const activeSeriesIds = new Map([...newSelection].filter(([key, value]) => value === true));
    const filteredActiveSeries = getFilteredActiveSeries(dataset.series, activeSeriesIds);

    return this.setState(
      {
        selectedSeriesIds: newSelection,
        animateTransition: true,
      },
      () => {
        // Only ask for fetch if the series is not in the dataset already
        return selectedSeriesIds.has(trancheId)
          ? this.update(filteredActiveSeries, dateRange)
          : this.props.handleSelectSeries({
              trancheId,
            });
      },
    );
  };

  handleBrushRange = (dateRange) => {
    const { seriesListForBrush } = this.state;
    // need dateRange as Unix Time in milliseconds (not an actual date)
    const selectionStartDate = moment(dateRange[0]).valueOf();
    const selectionEndDate = moment(dateRange[1]).valueOf();

    this.setState({
      dateRange: [selectionStartDate, selectionEndDate],
      animateTransition: false,
    });
    this.update(seriesListForBrush, dateRange);
  };

  handleBrushStart = () => {
    // this.setState({ animateTransition: false });
  };

  handleBrushEnd = () => {
    // this.setState({ animateTransition: false });
  };

  // Legend will show only instruments under the selected metric
  pickInstrumentsBySelectedMetric = () => {
    const { selectedMetric, options, optionsInstruments } = this.props;

    return options[selectedMetric.label].map((trancheId) => optionsInstruments[trancheId]);
  };

  render() {
    return (
      <div className={styles.mainGraph}>
        {this.state.dataLoaded && (
          <>
            <GraphContainer
              width={this.props.width}
              height={this.props.height - 80}
              companyId={this.props.companyId}
              selectedDates={this.state.selectedDates}
              seriesList={this.state.seriesList}
              animateTransition={this.state.animateTransition}
              currentHoveredSerieIndex={this.state.currentHoveredSerieIndex}
            />
            <Brush
              width={this.props.width}
              height={80}
              series={this.state.seriesListForBrush}
              dates={this.state.dates}
              x={margin.yAxis}
              y={0}
              animateTransition={this.state.animateTransition}
              dateRange={this.state.dateRange}
              onBrushChange={this.handleBrushRange}
              onBrushStart={this.handleBrushStart}
              onBrushEnd={this.handleBrushEnd}
            />
            <Legend
              width={this.props.width}
              height={120} // see css to change height
              optionsInstruments={this.pickInstrumentsBySelectedMetric()}
              handleSelectSeries={this.handleSelectSeries}
              x={margin.yAxis}
              y={0}
              selectedSeriesIds={this.state.selectedSeriesIds}
              series={this.state.seriesListForBrush} // just for color[i]
              setCurrentHoveredSerieIndex={this.setCurrentHoveredSerieIndex} // keeps record of currently hovered serie
            />
          </>
        )}
      </div>
    );
  }
}

export default MainGraph;
