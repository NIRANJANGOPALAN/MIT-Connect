'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import styles from './DbConnector.module.css';
import { useDbConnection } from './DBConnectionProvider';
import Plots from '../UserCharts/Plots';
import { API_BASE_URL } from '@/app/API/Config';


export default function DbConnector() {
  const [dbType, setDbType] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableDetails, setTableDetails] = useState(null);
  const [tableRecords, setTableRecords] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [downloadFormat, setDownloadFormat] = useState('');

  const { updateConnectionDetails, updateSelectedTable } = useDbConnection();
  const handleSubmit = async (e) => {
    e.preventDefault();
    updateConnectionDetails({
      dbType,
      host,
      port,
      username,
      password,
      database
    });
    const response = await fetch(`${API_BASE_URL}/api/connect`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbType, host, port, username, password, database }),
    });
    const data = await response.json();
    if (data.tables) {
      setTables(data.tables);
      setSelectedTable(null);
      setTableDetails(null);
      setTableRecords(null);
    }
  };

  const handleDisconnect = async (e) => {
    setTables(0);
    setSelectedTable(null);
    setTableDetails(null);
    setTableRecords(null);
  }

  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    updateSelectedTable(tableName);
    const response = await fetch(`${API_BASE_URL}/api/table-details`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbType, host, port, username, password, database, tableName }),
    });
    const data = await response.json();
    setTableDetails(data);
    setTableRecords(null);
    setCurrentPage(1);
    console.log("summary", data);
  };

  const handleShowRecords = async () => {
    const response = await fetch(`${API_BASE_URL}/api/table-records`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dbType, host, port, username, password, database,
        tableName: selectedTable,
        page: currentPage,
        perPage: 10
      }),
    });
    const data = await response.json();
    setTableRecords(data.records);
    console.log("show records", data.records);
    setTotalPages(Math.ceil(data.totalRecords / 10));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    handleShowRecords();
  };



  // Function to download Excel
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, selectedTable);
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${selectedTable}.xlsx`);
  };

  // Function to download CSV
  const downloadCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableRecords);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${selectedTable}.csv`);
  };

  // Function to download JSON
  const downloadJSON = () => {
    const json = JSON.stringify(tableRecords, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, `${selectedTable}.json`);
  };

  // Handle downloading table records
  const handleDownload = () => {
    if (!tableRecords || tableRecords.length === 0) return;

    switch (downloadFormat) {
      case 'excel':
        downloadExcel();
        break;
      case 'csv':
        downloadCSV();
        break;
      case 'json':
        downloadJSON();
        break;
      default:
        alert('Please select a format to download.');
    }
  };



  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <select
            value={dbType}
            onChange={(e) => setDbType(e.target.value)}
            className={styles.select}
          >
            <option value="">Select Database Type</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL</option>
            <option value="oracle">Oracle</option>
            <option value="sqlserver">SQL Server</option>
          </select>
          <input
            type="text"
            placeholder="Host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="Database"
            value={database}
            onChange={(e) => setDatabase(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Connect</button>
          <button type="button" onClick={handleDisconnect} className={styles.button}>Disconnect</button>
        </div>
      </form>

      <div className={styles.contentWrapper}>
        <div className={styles.sideColumns}>
          {tables.length > 0 && (
            <div className={styles.tableListContainer}>
              <h2 className={styles.tableListTitle}>Tables:</h2>
              <ul className={styles.tableList}>
                {tables.slice(0, tables.length).map((table, index) => (
                  <li
                    key={index}
                    className={`${styles.tableListItem} ${selectedTable === table ? styles.selectedTable : ''}`}
                    onClick={() => handleTableSelect(table)}
                  >
                    {table}
                  </li>
                ))}
              </ul>

            </div>
          )}
          <br></br>
          {tableDetails && (
            <Plots />
          )}
        </div>
        {tableDetails && (
          <div className={styles.tableDetailsContainer}>
            <h2 className={styles.tableDetailsTitle}>{selectedTable} Details:</h2>
            <div className={styles.tableDetailsContent}>
              <h3>Record Count:</h3>
              <p>{tableDetails.recordCount || 'N/A'}</p>
              <h3>Columns:</h3>
              <ul>
                {(tableDetails?.columns || []).map((column, index) => (
                  <li key={index}>{column.name} ({column.type})</li>
                ))}
              </ul>
              <h3>Primary Key:</h3>
              <p>{tableDetails.primaryKey ? tableDetails.primaryKey.join(', ') : 'None'}</p>
              <h3>Foreign Keys:</h3>
              <ul>
                {(tableDetails.foreignKeys || []).map((fk, index) => (
                  <li key={index}>
                    {fk.columns.join(', ')} references {fk.referredTable}
                  </li>
                ))}
              </ul>
              <h3>Indexes:</h3>
              <ul>
                {(tableDetails.indexes || []).map((index, idx) => (
                  <li key={idx}>
                    {index.name}: {index.columns.join(', ')}
                  </li>
                ))}
              </ul>
              {/* Descriptive Summary Section */}
              {tableDetails && tableDetails.summary && (
                <div className={styles.summaryContainer}>
                  <h3>Descriptive Summary:</h3>
                  {Object.entries(tableDetails.summary).map(([column, stats]) => (
                    <div key={column} className={styles.columnSummary}>
                      <h4>{column}</h4>
                      <table className={styles.summaryTable}>
                        <tbody>
                          {Object.entries(stats).map(([stat, value]) => (
                            <tr key={stat}>
                              <td>{stat}</td>
                              <td>{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}


              <button onClick={handleShowRecords} className={styles.button}>Show Records</button>
              {tableRecords && (
                <div className={styles.downloadContainer}>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Select Download Format</option>
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="json">JSON (.json)</option>
                  </select>
                  <button onClick={handleDownload} className={styles.button}>
                    Download
                  </button>
                </div>
              )}
              {tableRecords && (
                <div className={styles.tableRecordsContainer}>
                  <h3>Table Records:</h3>
                  <table className={styles.recordsTable}>
                    <thead>
                      <tr>
                        {Object.keys(tableRecords[0]).map((key) => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableRecords.map((record, index) => (
                        <tr key={index}>
                          {Object.values(record).map((value, idx) => (
                            <td key={idx}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.pagination}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

    </div>
  );
}