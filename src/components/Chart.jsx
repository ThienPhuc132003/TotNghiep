// src/components/Chart.jsx
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import PropTypes from "prop-types";
const ChartComponent = ({ type, data, options }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const chartInstance = new Chart(ctx, {
      type,
      data,
      options,
    });

    return () => {
      chartInstance.destroy();
    };
  }, [type, data, options]);

  return <canvas ref={chartRef}></canvas>;
};

ChartComponent.propTypes = {
  type: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
};
const ChartCustom = React.memo(ChartComponent);
export default ChartCustom;
