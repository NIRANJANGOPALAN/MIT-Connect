import React, { createContext, useState, useContext } from 'react';

// Create the context
const DbConnectionContext = createContext();

// Create a provider component
export const DbConnectionProvider = ({ children }) => {
  const [connectionDetails, setConnectionDetails] = useState({
    dbType: '',
    host: '',
    port: '',
    username: '',
    password: '',
    database: ''
  });

  const [selectedTable, setSelectedTable] = useState(null);

  // Method to update connection details
  const updateConnectionDetails = (details) => {
    setConnectionDetails(details);
  };

  // Method to update selected table
  const updateSelectedTable = (table) => {
    setSelectedTable(table);
  };

  return (
    <DbConnectionContext.Provider 
      value={{ 
        connectionDetails, 
        updateConnectionDetails, 
        selectedTable, 
        updateSelectedTable 
      }}
    >
      {children}
    </DbConnectionContext.Provider>
  );
};

// Custom hook to use the context
export const useDbConnection = () => {
  const context = useContext(DbConnectionContext);
  if (!context) {
    throw new Error('useDbConnection must be used within a DbConnectionProvider');
  }
  return context;
};