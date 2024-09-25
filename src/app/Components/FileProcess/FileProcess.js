'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const FileProcess = ({ file }) => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    if (file) {
      processFile(file);
    }
  }, [file]);

  const processFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target.result;
      if (file.name.endsWith('.csv')) {
        processCsv(data);
      } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
        processExcel(data);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const processCsv = (data) => {
    Papa.parse(data, {
      complete: (result) => {
        setTotalRecords(result.data.length - 1); // Subtract 1 to exclude header row
        setHeaders(result.data[0]);
      }
    });
  };

  const processExcel = (data) => {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    setTotalRecords(jsonData.length - 1); // Subtract 1 to exclude header row
    setHeaders(jsonData[0]);
  };

  return (
    <div>
      <h2>File Processing Results</h2>
      <p>Total Records: {totalRecords}</p>
      <h3>Headers:</h3>
      <ul>
        {headers.map((header, index) => (
          <li key={index}>{header}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileProcess;