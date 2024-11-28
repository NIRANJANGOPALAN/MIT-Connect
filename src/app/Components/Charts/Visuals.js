'use client';

import { useState, useEffect, useRef } from 'react';
import { Select, MenuItem, Paper, Typography, CircularProgress, Grid } from '@mui/material';
import * as d3 from 'd3';
import { API_BASE_URL } from '@/app/API/Config';

const Visuals = ({ file }) => {
  const [headers, setHeaders] = useState([]);
  const [selectedHeaderX, setSelectedHeaderX] = useState('');
  const [selectedHeaderY, setSelectedHeaderY] = useState('');
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (file) {
      fetchData();
    }
  }, [file]);

  useEffect(() => {
    if (chartData && selectedHeaderX) {
      drawChart();
    }
  }, [chartData, selectedHeaderX, selectedHeaderY, chartType]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/process-file`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      const numericHeaders = data.headers.filter(h => h.type === 'int64' || h.type === 'float64');
      setHeaders(numericHeaders);
      setChartData(data.chart_data);
      if (numericHeaders.length > 0) {
        setSelectedHeaderX(numericHeaders[0].name);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeaderXChange = (event) => {
    setSelectedHeaderX(event.target.value);
  };

  const handleHeaderYChange = (event) => {
    setSelectedHeaderY(event.target.value);
  };

  const handleChartTypeChange = (event) => {
    setChartType(event.target.value);
  };

  const drawChart = () => {
    if (!chartRef.current || !chartData || !selectedHeaderX) return;

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    let xData, yData;

    if (selectedHeaderY) {
      // Two headers selected
      xData = chartData[selectedHeaderX].scatter.map(d => d.y);
      yData = chartData[selectedHeaderY].scatter.map(d => d.y);
    } else {
      // Only one header selected
      xData = chartData[selectedHeaderX].scatter.map(d => d.x);
      yData = chartData[selectedHeaderX].scatter.map(d => d.y);
    }

    const x = d3.scaleLinear()
      .domain([0, d3.max(xData)])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(yData)])
      .range([height, 0]);

    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));

    if (chartType === 'bar') {
      svg.selectAll("rect")
        .data(yData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("width", width / yData.length)
        .attr("height", d => height - y(d))
        .attr("fill", "steelblue");
    } else if (chartType === 'scatter') {
      svg.selectAll("circle")
        .data(yData)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(xData[i]))
        .attr("cy", d => y(d))
        .attr("r", 5)
        .attr("fill", "steelblue");
    }

    // Add x-axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text(selectedHeaderX);

    // Add y-axis label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .text(selectedHeaderY || selectedHeaderX);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <div>
      <Grid container spacing={2} style={{ marginBottom: 20 }}>
        <Grid item xs={4}>
          <Typography>X-Axis:</Typography>
          <Select
            value={selectedHeaderX}
            onChange={handleHeaderXChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="" disabled>Select X-axis header</MenuItem>
            {headers.map((header) => (
              <MenuItem key={header.name} value={header.name}>{header.name}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={4}>
          <Typography>Y-Axis:</Typography>
          <Select
            value={selectedHeaderY}
            onChange={handleHeaderYChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="">None (Use X-axis header)</MenuItem>
            {headers.map((header) => (
              <MenuItem key={header.name} value={header.name}>{header.name}</MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={4}>
          <Typography>Chart Type:</Typography>
          <Select
            value={chartType}
            onChange={handleChartTypeChange}
            displayEmpty
            fullWidth
          >
            <MenuItem value="bar">Bar Chart</MenuItem>
            <MenuItem value="scatter">Scatter Plot</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <div ref={chartRef}></div>
      </Paper>
    </div>
  );
};

export default Visuals;