import React from 'react';
import AlternativeCard from './AlternativeCard';

const AlternativeList = ({ alternatives, onAddFood, explanations }) => (
  <div className="alternatives-grid">
    {alternatives.map((food, index) => (
      <AlternativeCard
        key={index}
        food={food}
        onAddFood={onAddFood}
        explanation={explanations[food.food_name]}
      />
    ))}
  </div>
);

export default AlternativeList;
