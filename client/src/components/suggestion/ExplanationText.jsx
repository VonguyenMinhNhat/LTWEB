import React from 'react';

const ExplanationText = ({ text }) => (
  <p className="explanation">
    {text || '🔄 Đang tạo giải thích...'}
  </p>
);

export default ExplanationText;
