import type { ScaleLinear, ScaleTime } from 'd3-scale';

export interface Series {
  key: string;
  amount: number;
  color: number;
  coupon: number;
  currencyRefCode: string;
  debtSecurityRefName: string;
  issueDate: string;
  maturity: string;
  trancheId: string;
  values: number[];
}

export interface GraphProps {
  keyVal: string;
  animateTransition: boolean;
  series: Series[];
  selectedDates: Date[];
  width: number;
  height: number;
  x: number;
  y: number;
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  currentHoveredSerieIndex: number;
}

export interface GraphContainerProps {
  width: number;
  height: number;
  companyId: string;
  selectedDates: Date[];
  seriesList: Series[];
  animateTransition: boolean;
  currentHoveredSerieIndex: number;
}

export interface Scales {
  xScale: ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
}

interface Dataset {
  dates: number[];
  series: Series[];
}

export interface MainGraphProps {
  companyId: string;
  dataset: Dataset;
  options: any;
  optionsInstruments: string;
  width: number;
  height: string;
  handleSelectSeries: (_: string) => void;
  selectedMetric: {
    label: string;
    value: string;
  };
}
