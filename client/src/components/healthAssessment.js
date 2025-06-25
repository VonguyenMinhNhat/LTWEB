export function generateHealthAssessment(data) {
  const { height, weight, age, gender, activityLevel, bmi, calories } = data;

  const idealMin = (18.5 * (height / 100) ** 2).toFixed(1);
  const idealMax = (24.9 * (height / 100) ** 2).toFixed(1);

  let bmiStatus = '';
  let bmiAdvice = '';
  const bmiValue = Number(bmi);

  if (bmiValue < 18.5) {
    bmiStatus = 'underweight';
    bmiAdvice = 'You should improve your nutrition and aim to gain weight in a healthy way.';
  } else if (bmiValue < 25) {
    bmiStatus = 'normal';
    bmiAdvice = 'You are at a healthy weight. Keep up your current habits!';
  } else if (bmiValue < 30) {
    bmiStatus = 'overweight';
    bmiAdvice = 'Consider reviewing your diet and increasing physical activity.';
  } else {
    bmiStatus = 'obese';
    bmiAdvice = 'It is recommended to create a proper weight loss plan and monitor your health closely.';
  }

  let activityText = '';
  if (activityLevel === 'Low') activityText = 'Your current activity level is low. Try to move or exercise more regularly.';
  if (activityLevel === 'Moderate') activityText = 'You are moderately active. Keep it up!';
  if (activityLevel === 'High') activityText = 'You are very active — great for cardiovascular and overall health.';

  let weightComment = '';
  if (weight < idealMin) {
    weightComment = 'Your current weight is slightly below the ideal range.';
  } else if (weight > idealMax) {
    weightComment = 'Your weight is above the ideal range. Take caution.';
  } else {
    weightComment = 'Your weight is appropriate for your height.';
  }

  return `
You are a ${gender === 'Male' ? 'male' : 'female'}, ${age} years old, ${height} cm tall and weigh ${weight} kg.
- Your BMI is ${bmiValue.toFixed(1)} (${bmiStatus}).
- ${weightComment}
- The ideal weight range for you is between ${idealMin} and ${idealMax} kg.
- Your estimated daily calorie needs are around ${calories} kcal.
- ${activityText}

💡 Suggestion: ${bmiAdvice}
  `;
}
