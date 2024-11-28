'use client';

import { useState, useEffect } from 'react';
import { useDbConnection } from '../DBConnector/DBConnectionProvider';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { API_BASE_URL } from '@/app/API/Config';

export default function Plots() {
    const { connectionDetails, selectedTable } = useDbConnection();
    const [columnHeaders, setColumnHeaders] = useState([]);
    const [selectedHeader, setSelectedHeader] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchColumnHeaders = async () => {
            if (connectionDetails && selectedTable) {
                setLoading(true);
                setError(''); // Reset error state
                try {
                    const response = await fetch(`${API_BASE_URL}/api/column-headers`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            dbType: connectionDetails.dbType,
                            host: connectionDetails.host,
                            port: connectionDetails.port,
                            username: connectionDetails.username,
                            password: connectionDetails.password,
                            database: connectionDetails.database,
                            tableName: selectedTable,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setColumnHeaders(data.columnHeaders);
                    console.log("data.columnHeaders",data.columnHeaders);
                } catch (error) {
                    console.error("Error fetching column headers:", error);
                    setError('Failed to fetch column headers. Please try again.');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchColumnHeaders();
    }, [connectionDetails, selectedTable]);

    const handleHeaderChange = (event) => {
        setSelectedHeader(event.target.value);
    };
    return (
        <div>
            <h2>Visualise your Data</h2>
            {loading && <p>Loading column headers...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <FormControl fullWidth variant="outlined" disabled={loading}>
                <InputLabel id="header-select-label">Select Column Header</InputLabel>
                <Select
                    labelId="header-select-label"
                    value={selectedHeader}
                    onChange={handleHeaderChange}
                    label="Select Column Header"
                >
                    {columnHeaders.map((header) => (
                        <MenuItem key={header} value={header}>
                            {header}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </div>
    );
}