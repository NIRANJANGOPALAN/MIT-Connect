'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CircularProgress, Typography } from '@mui/material';
import { API_BASE_URL } from '@/app/API/Config';

const CorrelationMatrix = ({ file }) => {
  const [correlationData, setCorrelationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  console.log("corr", correlationData);
  useEffect(() => {
    if (file) {
      fetchCorrelationData(file);
    }
  }, [file]);

  useEffect(() => {
    if (correlationData) {
      drawChart();
    }
  }, [correlationData]);

  const fetchCorrelationData = async (file) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/process-file`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File processing failed');
      }

      const data = await response.json();
      setCorrelationData(data.correlation_matrix);
      
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const drawChart = () => {
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    d3.select(chartRef.current).selectAll("*").remove();

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const variables = Object.keys(correlationData);
    const n = variables.length;

    const x = d3.scaleBand()
      .range([0, width])
      .domain(variables)
      .padding(0.05);

    const y = d3.scaleBand()
      .range([height, 0])
      .domain(variables)
      .padding(0.05);

    const color = d3.scaleLinear()
      .domain([-1, 0, 1])
      .range(["#B22222", "#FFFFFF", "#000080"]);

    // Create the squares
    svg.selectAll()
      .data(variables.flatMap(row => variables.map(col => ({ row, col }))))
      .join("rect")
        .attr("x", d => x(d.col))
        .attr("y", d => y(d.row))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => color(correlationData[d.row][d.col]))
        .style("stroke", "black")
        .style("stroke-width", 1);

    // Add the correlation values
    svg.selectAll()
      .data(variables.flatMap(row => variables.map(col => ({ row, col }))))
      .join("text")
        .attr("x", d => x(d.col) + x.bandwidth() / 2)
        .attr("y", d => y(d.row) + y.bandwidth() / 2)
        .attr("dy", ".35em")
        .text(d => d.row !== d.col ? correlationData[d.row][d.col].toFixed(2) : "")
        .style("font-size", "10px")
        .style("text-anchor", "middle")
        .style("fill", d => Math.abs(correlationData[d.row][d.col]) > 0.5 ? "white" : "black");

    // Add x-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)");

    // Add y-axis
    svg.append("g")
      .call(d3.axisLeft(y));

    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Correlation Matrix");
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!correlationData) {
    return null;
  }

  return <div ref={chartRef}></div>;
};

export default CorrelationMatrix;