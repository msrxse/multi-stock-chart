/**
 *
 * DOT svg
 * @param {size} string
 * @param {color} string
 */
const Icon = ({ size, color }) => (
  <svg height="18" width="18">
    <circle cx={10} cy={10} r={size} fill={color} />
  </svg>
);

export default Icon;
