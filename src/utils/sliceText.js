const sliceText = (text = '') => {
  const limit = 15;
  const len = text.length;
  if (len > limit * 2) {
    return `${text.substring(0, limit)}...${text.substring(len - limit, len)}`;
  }
  return text;
}

export default sliceText;