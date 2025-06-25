import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import SuggestionControls from '../components/suggestion/SuggestionControls';
import '../styles/foodSearch.css';
import { FaMagic } from 'react-icons/fa';

const HealthierSuggestionsPage = ({
  token: propsToken,
  onAddFood = () => {},
  autoSuggest = false,
  onToggleAutoSuggest = () => {},
  autoSuggestDelay = 2000,
}) => {
  const [criteria, setCriteria] = useState({
    increaseProtein: false,
    reduceFat: true,
    reduceCarbs: false,
    reduceCalories: true,
  });
  const [aiSuggestions, setAiSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchTimeoutRef = useRef(null);

  const fetchAISuggestions = useCallback(async () => {
    const token = propsToken || localStorage.getItem('token');
    if (!token) {
      setError('❌ Invalid or missing token.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        '/api/foods/ai-suggestions',
        { criteria },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setAiSuggestions(res.data);
    } catch (err) {
      console.error('API error:', err);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        setError('🔒 Your session has expired. Please log in again.');
      } else {
        setError(err?.response?.data?.error || err.message || '❌ Failed to fetch AI suggestions.');
      }
      setAiSuggestions('');
    } finally {
      setIsLoading(false);
    }
  }, [criteria, propsToken]);

  useEffect(() => {
    if (!autoSuggest) return;
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(fetchAISuggestions, autoSuggestDelay);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [autoSuggest, fetchAISuggestions, autoSuggestDelay]);

  return (
    <div className="container py-5 healthier-suggestions-container" style={{ maxWidth: 1000 }}>
      <div className="row">
        {/* Left: Filters */}
        <div className="col-12 col-md-4 mb-4 d-flex justify-content-center">
          <SuggestionControls
            criteria={criteria}
            onCriteriaChange={(key, val) => setCriteria((prev) => ({ ...prev, [key]: val }))}
            onSuggestClick={fetchAISuggestions}
            isLoading={isLoading}
          />
        </div>

        {/* Right: Result */}
        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-lg" style={{ borderRadius: 18 }}>
            <div
              className="card-header text-white d-flex align-items-center"
              style={{
                background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              }}
            >
              <FaMagic className="me-2" />
              <h5 className="mb-0 fw-bold text-uppercase">AI Food Suggestions</h5>
            </div>

            <div className="card-body bg-light" style={{ borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
              {/* Error message */}
              {error && (
                <div className="alert alert-danger text-center fw-semibold shadow-sm rounded-3" style={{ fontSize: 17 }}>
                  {error}
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="d-flex justify-content-center my-5">
                  <div className="spinner-border text-success" role="status" style={{ width: 48, height: 48 }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}

              {/* No data */}
              {!isLoading && !error && !aiSuggestions && (
                <div className="alert alert-info text-center shadow-sm rounded-3" style={{ fontSize: 17 }}>
                  No suitable suggestions found. Try adjusting the criteria!
                </div>
              )}

              {/* AI Suggestions */}
              {aiSuggestions && (
                <div className="bg-white p-3 rounded-3 border">
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
                      fontSize: 17,
                      color: '#333',
                      margin: 0,
                    }}
                  >
                    {aiSuggestions}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthierSuggestionsPage;
