const withSign = (num: number): string => {
  return `${num >= 0 ? "+" : ""}${num}`;
};

export default withSign;
