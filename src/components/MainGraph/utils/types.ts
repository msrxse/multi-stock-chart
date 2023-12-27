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

type HandleSelectSeries = (instrument: Instrument) => void;

export interface MainGraphProps {
  companyId: string;
  dataset: Dataset;
  optionsInstruments: any;
  width: number;
  height: number;
  handleSelectSeries: HandleSelectSeries;
}

export interface MainContainerProps {
  companyId: string;
  pricing: Dataset;
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
  orientation: 'left' | 'right' | 'bottom';
  scale: ScaleTime<number, number>;
  view: string;
  width: number;
  x: number;
  y: number;
  tickNum?: number;
}

export type DateRange = [number, number] | undefined;

export interface BrushProps {
  width: number;
  height: number;
  series: Series[];
  dates: number[];
  x: number;
  y: number;
  animateTransition: boolean;
  dateRange: DateRange;
  onBrushChange: (dateRange: DateRange) => void;
  onBrushStart: () => void;
  onBrushEnd: () => void;
}

export type Id = string;

export interface Instrument {
  trancheId: string;
  amount: number;
  coupon: number;
  currencyRefCode: string;
  debtSecurityRefName: string;
  issueDate: string;
  maturity: string;
}

export interface LegendProps {
  handleSelectSeries: HandleSelectSeries;
  optionsInstruments: Instrument[];
  selectedSeriesIds: Map<string, boolean>;
  series: Series[];
  setCurrentHoveredSerieIndex: (trancheId: string | -1) => void;
  height: number;
  width: number;
  x: number;
  y: number;
}
