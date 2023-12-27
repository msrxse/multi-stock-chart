import { useEffect, useRef } from 'react';
import { axisLeft, axisBottom, axisRight } from 'd3-axis';
import { timeFormat } from 'd3-time-format';
import { select } from 'd3-selection';
import { AxisProps } from '../utils/types';

const monthDateFormat = "%d-%b-'%y";

function addCommas(x) {
  const parts = x.toString().split('.');

  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}

function formatTitle(s) {
  return s.replace('_', ' ');
}

function Axis(props: AxisProps) {
  const axisRef = useRef(null);

  useEffect(() => {
    drawAxis();
  }, []);

  useEffect(() => {
    updateAxis();
  }, [props]);

  let axis =
    (props.orientation === 'left' && axisLeft()) || (props.orientation === 'right' && axisRight()) || axisBottom();

  const drawAxis = () => {
    if (props.orientation === 'left') {
      axis = axisLeft()
        .scale(props.scale)
        .ticks(props.tickNum ? props.tickNum : 10)
        .tickFormat((d) => addCommas(d));

      if (axisRef.current) {
        select(axisRef.current).call(axis);
      }
    } else if (props.orientation === 'right') {
      axis = axisRight()
        .scale(props.scale)
        .tickFormat((d) => addCommas(d));

      if (axisRef.current) {
        select(axisRef.current).call(axis);
      }
    } else {
      if (props.view === 'graph') {
        axis = axisBottom()
          .scale(props.scale)
          .tickFormat(timeFormat(monthDateFormat))
          .ticks(props.width / 80)
          .tickSizeOuter(0);
      } else if (props.view === 'chart') {
        axis = axisBottom()
          .scale(props.scale)
          .tickFormat((d) => formatTitle(d))
          .ticks(props.width / 80)
          .tickSizeOuter(0);
      } else {
        axis = axisBottom()
          .scale(props.scale)
          .ticks(props.width / 80)
          .tickSizeOuter(0);
      }

      if (axisRef.current) {
        if (props.view === 'chart') {
          select(axisRef.current)
            .call(axis)
            .call((g) => g.select('.domain').remove())
            .call((g) => g.selectAll('text').attr('dy', '2em'));
        } else {
          select(axisRef.current)
            .call(axis)
            .call((g) => g.select('.domain').remove());
        }
      }
    }
  };

  const updateAxis = () => {
    if (axisRef.current) {
      const axisNode = select(axisRef.current);

      axis.scale(props.scale);
      if (props.orientation === 'left') {
        // update y axis
        axisNode
          .transition()
          .duration(1000)
          .call(axis)
          .call((g) => g.select('.domain').remove());
      } else {
        // update x axis
        axisNode.transition().duration(1000).call(axis);
      }

      if (props.view !== 'graph') {
        select(axisRef.current)
          .call(axis)
          .call((g) => g.select('.domain').remove());
      }
      if (props.view === 'chart') {
        select(axisRef.current)
          .call(axis)
          .call((g) => g.selectAll('text').attr('dy', '2em'));
      }
    }
  };

  return <g ref={axisRef} transform={`translate(${props.x}, ${props.y})`} />;
}

export default Axis;
