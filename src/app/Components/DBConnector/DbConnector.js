import { useState } from 'react';

export default function DbConnector() {
  const [dbType, setDbType] = useState('');
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [tables, setTables] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbType, host, port, username, password, database }),
    });
    const data = await response.json();
    console.log("db tables",data);
    if (data.tables) {
      setTables(data.tables);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <select value={dbType} onChange={(e) => setDbType(e.target.value)}>
          <option value="">Select Database Type</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
          <option value="oracle">Oracle</option>
          <option value="sqlserver">SQL Server</option>
        </select>
        <input type="text" placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
        <input type="text" placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} />
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="text" placeholder="Database" value={database} onChange={(e) => setDatabase(e.target.value)} />
        <button type="submit">Connect</button>
      </form>
      {tables.length > 0 && (
        <div>
          <h2>Tables:</h2>
          <ul>
            {tables.map((table, index) => (
              <li key={index}>{table}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}