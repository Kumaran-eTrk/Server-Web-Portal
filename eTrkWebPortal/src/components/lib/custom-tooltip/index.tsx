/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import PropTypes from "prop-types";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number | Date;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label
}) => {
  if (active && payload) {
    return (
      <div className="custom-tooltip bg-white w-auto h-auto rounded-xl text-start px-3" style={{ color: "#313545" }}>
        <p className="label ">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <div key={index} className="tooltip-value">
            <span
              className="color-box"
              style={{ backgroundColor: entry.color }}
            ></span>
            {/* Change 'nonproductive' to 'unproductive' in the tooltip */}
            <span>{`${entry.name === 'nonProductiveHours' ? 'Unproductive Hours' : entry.name}: ${entry.value}`}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)])
};

export default CustomTooltip;
