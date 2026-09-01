const matchId = (str: string): string | null => {
  const ids = str.match(/\d{17,19}/g);
  return ids ? ids[0] : null;
};

export default matchId;
