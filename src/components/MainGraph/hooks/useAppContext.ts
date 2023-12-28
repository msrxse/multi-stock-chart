import React from 'react';
import { AppChartContext } from '../utils/context';

export const useAppChartContext = () => {
  const context = React.useContext(AppChartContext);
  if (context === null) throw new Error('useAppChartContext should be used inside of LineChart component');
  return context;
};
