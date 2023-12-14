import React from 'react';
import { colors } from '../utils/colors';

function DateFilterLegend(props) {
  return (
    <g className="legend-container">
      <g className="legend">
        <rect
          x={props.x}
          y={props.y}
          width={165}
          height={50}
          fill={colors.graphBkgd}
          fillOpacity={0.5}
        />
        <g className="legend-above">
          <line
            x1={props.x}
            y1={props.y}
            x2={props.x + 20}
            y2={props.y}
            stroke={colors.blue}
            strokeWidth="1"
          />
          <text
            x={props.x + 25}
            y={props.y + 4}
            opacity={0.65}
            className="titleNarrow"
          >
            highlighted simulation
          </text>
        </g>
      </g>
      <g className="legend">
        <g className="legend-below">
          <line
            x1={props.x}
            y1={props.y + 20}
            x2={props.x + 20}
            y2={props.y + 20}
            stroke={colors.gray}
            strokeWidth="1"
          />
          <text
            x={props.x + 25}
            y={props.y + 20 + 4}
            opacity={0.65}
            className="titleNarrow"
          >
            other simulations
          </text>
        </g>
      </g>
    </g>
  );
}

export default DateFilterLegend;
