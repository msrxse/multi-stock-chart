interface IconProps {
  size: string;
  color: string;
}
/**
 *
 * DOT svg
 * @param {size} string
 * @param {color} string
 */
const Icon = ({ size, color }: IconProps) => (
  <svg height="18" width="18">
    <circle cx={10} cy={10} r={size} fill={color} />
  </svg>
);

export default Icon;
