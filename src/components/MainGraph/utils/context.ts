import React from 'react';
import { Dataset, OptionsInstrumentsDict, HandleSelectSeries } from './types';

export interface AppContextType {
  companyId: string;
  width: number;
  height: number;
  dataset: Dataset;
  optionsInstruments: OptionsInstrumentsDict;
  handleSelectSeries: HandleSelectSeries;
}

export const AppChartContext = React.createContext<AppContextType | null>(null);
