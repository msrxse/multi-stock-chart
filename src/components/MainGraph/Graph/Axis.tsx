import { useEffect, useRef } from 'react';
import { axisLeft, axisBottom, axisRight } from 'd3-axis';
import { select } from 'd3-selection';
import { AxisProps } from '../utils/types';
import { transition } from 'd3-transition';

select.prototype.transition = transition;

/**
 *
 * @param props
 * @returns
 */
function Axis(props: AxisProps) {
  const axisRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    drawAxis();
  }, []);

  useEffect(() => {
    updateAxis();
  }, [props]);

  if (!props.scale) {
    return null;
  }

  let axis =
    (props.orientation === 'left' && axisLeft(props.scale)) ||
    (props.orientation === 'right' && axisRight(props.scale)) ||
    axisBottom(props.scale);

  const drawAxis = () => {
    if (!props.scale) {
      return null;
    }

    if (props.orientation === 'left') {
      axis = axisLeft(props.scale).ticks(props.tickNum ? props.tickNum : 10);

      if (axisRef.current) {
        select(axisRef.current).call(axis);
      }
    } else if (props.orientation === 'right') {
      axis = axisRight(props.scale);

      if (axisRef.current) {
        select(axisRef.current).call(axis);
      }
    } else {
      if (props.view === 'graph') {
        axis = axisBottom(props.scale)
          .ticks(props.width / 80)
          .tickSizeOuter(0);
      } else if (props.view === 'chart') {
        axis = axisBottom(props.scale)
          .ticks(props.width / 80)
          .tickSizeOuter(0);
      } else {
        axis = axisBottom(props.scale)
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

      if (!props.scale) {
        return null;
      }

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
