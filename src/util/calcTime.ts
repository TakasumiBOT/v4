const calcTime = (ms: number): string => {
  const time: number = Math.round(ms / 1000);
  const hour: number = Math.floor(time / 3600);
  const minute: number = Math.floor((time - hour * 3600) / 60);
  const second: number = Math.floor(time - hour * 3600 - minute * 60);

  if (hour === 0) {
    if (minute === 0) {
      return `${second}秒`;
    } else {
      return `${minute}分${second}秒`;
    }
  } else {
    return `${hour}時間${minute}分${second}秒`;
  }
};

export default calcTime;
