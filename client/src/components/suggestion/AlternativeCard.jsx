import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ExplanationText from './ExplanationText';

const AlternativeCard = ({ food, onAddFood, explanation }) => (
  <div className="alternative-card">
    <h4>{food.food_name}</h4>
    <p>Calo: {food.nf_calories}</p>
    <p>Protein: {food.nf_protein}</p>
    <p>Carbs: {food.nf_total_carbohydrate}</p>
    <p>Fat: {food.nf_total_fat}</p>
    <ExplanationText text={explanation} />
    <button onClick={() => onAddFood(food)}>
      <FontAwesomeIcon icon={faPlus} /> Thêm món này
    </button>
  </div>
);

export default AlternativeCard;
