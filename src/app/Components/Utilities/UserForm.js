'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/app/API/Config';

const UserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    query: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-query`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit query');
      }

      setIsSubmitted(true);
      clearForm();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({ name: '', email: '', query: '' });
  };

    // Add this useEffect hook
    useEffect(() => {
      let timer;
      if (isSubmitted) {
        timer = setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      }
      return () => clearTimeout(timer);
    }, [isSubmitted]);

  return (
    <div className="form-container">
      <h2>User Feedback Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="query">How can we improve?</label>
          <textarea
            id="query"
            name="query"
            value={formData.query}
            className="long-textarea"
            onChange={handleChange}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={clearForm}>Clear</button>
        </div>
      </form>
      {isSubmitted && (
        <div className="popup">
          Your response has been submitted!
        </div>
      )}
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default UserForm;

