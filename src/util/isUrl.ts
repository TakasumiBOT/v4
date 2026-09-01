const isUrl = (url: string): boolean => {
  if (url.match(/^(http(s)?:\/\/)[^\s]+\.[^\s]+$/)) {
    return true;
  } else {
    return false;
  }
};

export default isUrl;
