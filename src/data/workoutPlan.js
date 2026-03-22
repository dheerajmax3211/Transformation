export const getWorkoutPlan = (weekNumber, dayType) => {
  if (dayType === 'REST') {
    return {
      title: "Rest Day",
      message: "Rest and recover — your muscles are rebuilding right now.",
      exercises: []
    };
  }

  const exercises = [];

  if (dayType === 'PUSH') {
    let pushUpVariation = "Regular Push-ups";
    if (weekNumber >= 3 && weekNumber <= 4) pushUpVariation = "Close-Grip Push-ups";
    if (weekNumber >= 5 && weekNumber <= 8) pushUpVariation = "2 sets Incline + 2 sets Decline Push-ups";
    if (weekNumber >= 9) pushUpVariation = "Archer Push-ups";

    exercises.push({ name: pushUpVariation, sets: 4, isWeighted: false });
    exercises.push({ name: "Tricep Dips on two chairs", sets: 3, isWeighted: false });
    exercises.push({ name: "Pike Push-ups", sets: 3, isWeighted: false });
    exercises.push({ name: "Diamond Push-ups", sets: 3, isWeighted: false });
  }

  if (dayType === 'PULL') {
    exercises.push({ name: "Pull-ups or Chin-ups", sets: 4, isWeighted: false, note: "If unable to do a pull-up, perform Negative Pull-ups: jump to bar top and lower slowly" });
    exercises.push({ name: "Resistance Band Rows", sets: 3, isWeighted: true });
    exercises.push({ name: "Resistance Band Bicep Curls", sets: 3, isWeighted: true });
  }

  if (dayType === 'LEGS') {
    let squatVariation = "Bodyweight Squats";
    if (weekNumber >= 5 && weekNumber <= 8) squatVariation = "Jump Squats";
    if (weekNumber >= 9) squatVariation = "Bulgarian Split Squats";

    exercises.push({ name: squatVariation, sets: 4, isWeighted: false });
    exercises.push({ name: "Lunges", sets: 3, isWeighted: false });
    exercises.push({ name: "Weighted Glute Bridges / Hip Thrusts", sets: 3, isWeighted: true });
    exercises.push({ name: "Plank holds", sets: 3, isWeighted: false });
    exercises.push({ name: "Leg Raises", sets: 3, isWeighted: false });
    exercises.push({ name: "Bicycle Crunches", sets: 3, isWeighted: false });
  }

  return {
    title: `${dayType} Day`,
    exercises
  };
};

export const WEIGHTED_EXERCISES = [
  "Resistance Band Bicep Curls",
  "Resistance Band Rows",
  "Weighted Glute Bridges / Hip Thrusts"
];
