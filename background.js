chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create("index.html", {
        "bounds": {
            "width": 450,
            "height": 500
        },
        "resizable": false
    });
});
