const getBoundingClientRect = (elm) => {
  const rect = elm.getBoundingClientRect();
  const { left, top, right, bottom } = rect;
  const width = rect.width || right - left;
  const height = rect.height || bottom - top;

  return {
    width,
    height,
    left,
    top,
    bottom,
    right,
  };
}

export default getBoundingClientRect;