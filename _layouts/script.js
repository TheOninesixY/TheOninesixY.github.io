if (window.location.hostname !== "oninesixy.pages.dev") {
  window.location.replace(
    "https://" + 
    "oninesixy.pages.dev" + 
    window.location.pathname + 
    window.location.search + 
    window.location.hash
  );
}