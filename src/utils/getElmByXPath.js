const getElmByXPath = (xpath) => {
  if (!xpath) {
    return null;
  }
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ANY_TYPE,
      null
    );
    return result.iterateNext();
  } catch (e) {
    console.error('getElmByXPath err is: ', e.toString());
    return null;
  }
};

export default getElmByXPath;
