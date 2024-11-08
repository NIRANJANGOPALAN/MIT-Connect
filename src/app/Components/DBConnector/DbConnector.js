'use client';

import { useState } from 'react';
import styles from './DbConnector.module.css';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbType, host, port, username, password, database }),
    });
    const data = await response.json();
    if (data.tables) {
      setTables(data.tables);
      setSelectedTable(null);
      setTableDetails(null);
    }
  };

  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    const response = await fetch('http://localhost:5000/api/table-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbType, host, port, username, password, database, tableName }),
    });
    const data = await response.json();
    setTableDetails(data);
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
        </div>
      </form>
      
      <div className={styles.contentWrapper}>
        {tables.length > 0 && (
          <div className={styles.tableListContainer}>
            <h2 className={styles.tableListTitle}>Tables:</h2>
            <ul className={styles.tableList}>
              {tables.map((table, index) => (
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

        {tableDetails && (
          <div className={styles.tableDetailsContainer}>
            <h2 className={styles.tableDetailsTitle}>{selectedTable} Details:</h2>
            <div className={styles.tableDetailsContent}>
              <h3>Columns:</h3>
              <ul>
                {tableDetails.columns.map((column, index) => (
                  <li key={index}>{column.name} ({column.type})</li>
                ))}
              </ul>
              <h3>Primary Key:</h3>
              <p>{tableDetails.primaryKey ? tableDetails.primaryKey.join(', ') : 'None'}</p>
              <h3>Foreign Keys:</h3>
              <ul>
                {tableDetails.foreignKeys.map((fk, index) => (
                  <li key={index}>
                    {fk.columns.join(', ')} references {fk.referredTable}
                  </li>
                ))}
              </ul>
              <h3>Indexes:</h3>
              <ul>
                {tableDetails.indexes.map((index, idx) => (
                  <li key={idx}>
                    {index.name}: {index.columns.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}