import React from 'react';

const criteriaLabels = {
  increaseProtein: 'Increase Protein',
  reduceFat: 'Reduce Fat',
  reduceCarbs: 'Reduce Carbs',
  reduceCalories: 'Reduce Calories',
};

const colorMap = {
  increaseProtein: '#4f8a8b',
  reduceFat: '#ffb259',
  reduceCarbs: '#f76e6e',
  reduceCalories: '#43cea2',
};

const SuggestionControls = ({
  criteria,
  onCriteriaChange,
  onSuggestClick,
  isLoading,
}) => (
  <div
    className="card shadow-sm mb-4 mx-auto"
    style={{
      width: 350,
      maxWidth: '100%',
      height: 380,
      borderRadius: 16,
      flexShrink: 0,
      overflow: 'hidden',
    }}
  >
    <div
      className="card-body d-flex flex-column align-items-stretch p-4"
      style={{ overflowY: 'auto' }}
    >
      <h5 className="card-title text-center mb-3" style={{ fontWeight: 600, fontSize: 20 }}>
        Choose Your Goal
      </h5>

      <div className="d-flex flex-column gap-2 mb-3">
        {Object.entries(criteria).map(([key, value]) => (
          <button
            key={key}
            type="button"
            className={`d-flex align-items-center px-3 py-2 rounded-pill fw-semibold shadow-sm border-0 criteria-btn ${value ? 'active' : ''}`}
            style={{
              background: value ? colorMap[key] : '#f3f4f6',
              color: value ? '#fff' : '#222',
              fontSize: 15,
              minHeight: 38,
              transition: 'all 0.18s',
              fontWeight: 600,
              boxShadow: value ? '0 2px 8px rgba(67,206,162,0.10)' : 'none',
              outline: value ? `2px solid ${colorMap[key]}` : 'none',
            }}
            onClick={() => onCriteriaChange(key, !value)}
          >
            <span className="me-2" style={{ fontSize: 18 }}>
              {value ? <i className="bi bi-check-circle-fill"></i> : <i className="bi bi-circle"></i>}
            </span>
            {criteriaLabels[key] || key}
          </button>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-auto">
        <button
          className="btn d-flex align-items-center justify-content-center px-4 py-2 rounded-pill fw-bold shadow-sm"
          onClick={onSuggestClick}
          disabled={isLoading}
          type="button"
          style={{
            background: 'linear-gradient(90deg, #43cea2 0%, #185a9d 100%)',
            color: '#fff',
            fontSize: 17,
            minWidth: 180,
            minHeight: 44,
            border: 'none',
            letterSpacing: 0.5,
            boxShadow: '0 4px 16px rgba(67,206,162,0.10)',
            transition: 'background 0.3s, box-shadow 0.2s',
          }}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Finding...
            </>
          ) : (
            <>
              <i className="bi bi-lightbulb me-2" style={{ fontSize: 22 }}></i>
              Suggest Healthy Meals
            </>
          )}
        </button>
      </div>
    </div>

    <style>
      {`
        .criteria-btn.active {
          box-shadow: 0 2px 8px rgba(67,206,162,0.13);
          border: none;
        }
        .criteria-btn:focus {
          outline: 2px solid #185a9d;
        }
      `}
    </style>
  </div>
);

export default SuggestionControls;
