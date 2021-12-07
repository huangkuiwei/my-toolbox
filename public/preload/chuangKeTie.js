(function () {
  let loginBtn;

  const timer = setInterval(() => {
    if (!loginBtn) {
      loginBtn = document.querySelector('.avatar-text a');
    } else {
      loginBtn.click();
      clearInterval(timer);
    }
  }, 20);
})();
