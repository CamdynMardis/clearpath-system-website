const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault();
    feedbackStatus.textContent = "Thank you for sharing your feedback.";
  });
}

const signinForm = document.getElementById("signin-form");
const signinStatus = document.getElementById("signin-status");

if (signinForm) {
  signinForm.addEventListener("submit", function (event) {
    event.preventDefault();
    signinStatus.textContent = "Sign-in demonstration submitted.";
  });
}
