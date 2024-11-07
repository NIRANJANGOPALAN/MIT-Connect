'use client';

import React, { useState, useEffect } from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import styles from './FileProcess.module.css';

export default function FileProcess({ file }) {
  const [fileData, setFileData] = useState({ headers: [], correlation_matrix: {},chart_data: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (file) {
      processFile(file);
    }
  }, [file]);

  const processFile = async (file) => {
    setIsLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/process-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File processing failed');
      }

      const data = await response.json();
      console.log("file process data",data);
      setFileData(data);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Paper elevation={3} className={styles.paper}>
      <Typography variant="h6" gutterBottom className={styles.title}>
        File Headers and Data Types
      </Typography>
      <TableContainer className={styles.tableContainer}>
        <Table size="small" className={styles.table}>
          <TableHead>
            <TableRow>
              <TableCell className={styles.headerCell}>Header Name</TableCell>
              <TableCell className={styles.headerCell}>Data Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fileData.headers.map((header, index) => (
              <TableRow key={index}>
                <TableCell className={styles.cell}>{header.name}</TableCell>
                <TableCell className={styles.cell}>{header.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}