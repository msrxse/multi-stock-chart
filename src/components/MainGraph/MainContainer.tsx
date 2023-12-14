import React, { Component } from 'react';
import MainGraph from './Graph/MainGraph';

import styles from './MainContainer.module.css';

class MainContainer extends Component {
  state = {
    selectedMetric: {
      label: '',
      value: '',
    },
  };

  /**
   * On mount gets the options default from redux as its available
   */
  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !prevState.selectedMetric.label &&
      nextProps.optionsDefault !== prevState.selectedMetric.label
    ) {
      return {
        selectedMetric: {
          label: nextProps.optionsDefault,
          value: nextProps.optionsDefault,
        },
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    /**
     * Keep updating state.selectedMetric on each rerender if optionsDefault changes
     * Update to the default option when it is fetched
     */
    if (
      prevProps.optionsDefault !== this.props.optionsDefault ||
      (prevProps.optionsFetching === true &&
        this.props.optionsFetching === false &&
        this.props.optionsDefault)
    ) {
      this.setState({
        selectedMetric: {
          label: this.props.optionsDefault,
          value: this.props.optionsDefault,
        },
      });
    }
  }

  /**
   * Dropdown handler
   * Pases needed data to saga
   */
  handleMetricSelection = (selected) => {
    const { label } = selected;

    this.setState({ selectedMetric: selected }, () =>
      this.props.handleMetricSelection({
        defaultSelected: label,
        trancheIds: this.props.options[label],
        instruments: this.props.optionsInstruments,
        ...(this.props.trancheId && { trancheId: this.props.trancheId }),
      })
    );
  };

  /**
   * Fires when user clicks on a chart label in legend
   */
  handleSelectSeries = ({ trancheId }) => {
    this.props.handleSelectChartSeries({
      trancheId,
      defaultSelected: this.state.selectedMetric.label,
    });
  };

  render() {
    const { options, optionsFetching, pricing, companyId } = this.props;
    const { selectedMetric } = this.state;

    return (
      <div data-testid="pricing-chart">
          <MainGraph
            companyId={companyId}
            dataset={pricing}
            options={options}
            optionsInstruments={this.props.optionsInstruments}
            width={1000}
            height="500"
            handleSelectSeries={this.handleSelectSeries}
            selectedMetric={selectedMetric}
          />
      </div>
    );
  }
}

export default MainContainer;
