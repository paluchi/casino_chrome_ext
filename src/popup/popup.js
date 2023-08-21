document
  .getElementById("apiKeyForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const apiKey = document.getElementById("apiKey").value;

    // Send a message to background.js
    chrome.runtime.sendMessage(
      { action: "saveApiKey", key: apiKey },
      function (response) {}
    );
  });
