let loaded = false;

(() => {
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    if (!loaded) {
      loaded = true;
      const apiKey = obj.apiKey;
      const operator = new Operator(apiKey);

      operator.init();
    }
  });
})();
