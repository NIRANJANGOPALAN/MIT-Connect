'use client';

import { useState, useRef  } from 'react';
import styles from './FileUpload..module.css';

const FileUpload = () => {
  const [fileName, setFileName] = useState('No file chosen');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log("file selected",file);
    setFileName(file ? file.name : 'No file chosen');
  };

  const handleClearFile = () =>{
    console.log("clicked clear");
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the input value
      setFileName('No file chosen'); // Reset displayed name
    }
  }

  return (
    <div className={styles.fileUploadContainer}>
      <label htmlFor="file-upload" className={styles.fileUploadButton}>
        Choose File
      </label>
      <input
        id="file-upload"
        type="file"
        onChange={handleFileChange}
        className={styles.fileInput}
        accept=".csv, .xls, .xlsx" // Accept only CSV and Excel files
        ref={fileInputRef}
      />
      <span className={styles.fileName}>{fileName}</span>
      <button onClick={handleClearFile}>
        Disconnect File
      </button>
    </div>
  );
};

export default FileUpload;