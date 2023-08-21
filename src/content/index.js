(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const apiKey = obj.apiKey;
    const operator = new Operator(apiKey);

    operator.init();
  });
})();
