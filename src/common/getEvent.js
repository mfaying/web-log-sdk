const getEvent = (e) => {
  const event = e || window.event;
  const targetElement= event.target || event.srcElement;
  return {
    event,
    targetElement,
  };
}

export default getEvent;