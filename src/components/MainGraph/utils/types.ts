/* eslint-disable no-unused-vars */
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
  tooltipYPos?: number;
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
  xScale: Scales['xScale'];
  yScale: Scales['yScale'];
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
  xScale?: XScale;
  yScale?: YScale;
}

export type XScale = ScaleTime<number, number>;
export type YScale = ScaleLinear<number, number>;

export interface Dataset {
  dates: number[];
  series: Series[];
}

export type HandleSelectSeries = (instrument: Instrument) => void;
export type OptionsInstrumentsDict = { [key: string]: Instrument };

export interface MainGraphInitializeProps {
  dates: number[];
  series: Series[];
}

export interface AxisProps {
  height: number;
  orientation: 'left' | 'right' | 'bottom';
  scale: ScaleTime<number, number> | ScaleLinear<number, number> | undefined;
  width: number;
  x: number;
  y: number;
  tickNum?: number;
  view?: 'graph' | 'chart';
}

export type DateRange = [Date, Date] | [number, number] | undefined;

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
  onBrushStart: () => null;
  onBrushEnd: () => null;
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

export type SelectedSeriesIds = Map<string, boolean>;

export interface LegendProps {
  handleSelectSeries: HandleSelectSeries;
  optionsInstruments: Instrument[];
  selectedSeriesIds: SelectedSeriesIds;
  series: Series[];
  setCurrentHoveredSerieIndex: (trancheId: string | -1) => void;
  height: number;
  width: number;
  x: number;
  y: number;
}
