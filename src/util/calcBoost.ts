const calcBoost = (count: number | null): number => {
  if (!count) return 0;

  if (count >= 14) {
    return 3;
  } else if (count <= 13 && count >= 7) {
    return 2;
  } else if (count <= 6 && count >= 2) {
    return 1;
  } else {
    return 0;
  }
};

export default calcBoost;
