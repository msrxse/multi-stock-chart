import type { ScaleLinear, ScaleTime } from 'd3-scale';

export interface Series {
  key: string;
  amount: number;
  color: string;
  coupon: number;
  currencyRefCode: string;
  debtSecurityRefName: string;
  issueDate: string;
  maturity: string;
  trancheId: string;
  values: (number | null)[];
}

export interface GraphProps {
  keyVal: string;
  animateTransition: boolean;
  series: Series[];
  selectedDates: number[];
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
  selectedDates: number[];
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

type HandleSelectSeries = ({ trancheId, defaultSelected }: { trancheId: string; defaultSelected?: string }) => void;

export interface MainGraphProps {
  companyId: string;
  dataset: Dataset;
  options: any;
  optionsInstruments: any;
  width: number;
  height: number;
  handleSelectSeries: HandleSelectSeries;
  selectedMetric: {
    label: string;
    value: string;
  };
}

export interface MainContainerProps {
  companyId: string;
  pricing: Dataset;
  options: any;
  optionsDefault: string;
  optionsInstruments: any;
  handleSelectSeries: HandleSelectSeries;
}

export interface Tranche {
  amount: string;
  currencyRefCode: string;
  coupon: string;
  maturity: string;
  debtSecurityRefName: string;
}

export interface AxisProps {
  height: number;
  keyVal: string;
  orientation: string;
  scale: ScaleTime<number, number>;
  view: string;
  width: number;
  x: number;
  y: number;
  tickNum: number;
}

export type DateRange = [Date | number, Date | number] | undefined;
