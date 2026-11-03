const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");

if (feedbackForm) {
  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault();
    feedbackStatus.textContent = "Thank you for sharing your feedback.";
  });
}

const testUsers = [
  {
    username: "clearpath-admin",
    password: "Admin123!",
    role: "admin",
  },
  {
    username: "clearpath-user",
    password: "User123!",
    role: "user",
  },
];

console.log(`
DEV TEST ACCOUNTS

ADMIN
username: clearpath-admin
password: Admin123!

USER
username: clearpath-user
password: User123!
`);

const signinForm = document.getElementById("signin-form");
const signinStatus = document.getElementById("signin-status");

if (signinForm) {
  signinForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const matchingUser = testUsers.find(function (user) {
      return user.username === username && user.password === password;
    });

    if (!matchingUser) {
      signinStatus.textContent =
        "Sign-in failed. Check your username and password.";
      return;
    }

    const currentUser = {
      username: matchingUser.username,
      authenticated: true,
      role: matchingUser.role,
    };

    try {
      sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
      signinStatus.textContent = `Signed in as ${currentUser.username}.`;
      updateSigninInterface();

      console.log("[AUTH] Signed in:", currentUser.username);
      console.log("[AUTHZ] Role:", currentUser.role);
    } catch (error) {
      signinStatus.textContent =
        "Unable to save your sign-in. Please try again.";
      console.error("[SESSION] Could not save sign-in:", error);
    }
  });
}

const signoutButton = document.getElementById("signout-button");

function updateSigninInterface() {
  if (!signinForm || !signoutButton) {
    return;
  }

  try {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    const signedIn = currentUser && currentUser.authenticated === true;

    signinForm.hidden = signedIn;
    signoutButton.hidden = !signedIn;

    if (signedIn) {
      signinStatus.textContent = `Signed in as ${currentUser.username}.`;
    }
  } catch (error) {
    signinStatus.textContent = "Unable to read your saved sign-in.";
    console.error("[SESSION] Could not read sign-in:", error);
  }
}

if (signoutButton) {
  signoutButton.addEventListener("click", function () {
    try {
      sessionStorage.removeItem("currentUser");
      signinForm.reset();
      updateSigninInterface();
      signinStatus.textContent = "You have signed out.";
      console.log("[AUTH] User signed out");
    } catch (error) {
      signinStatus.textContent = "Unable to sign out. Please try again.";
      console.error("[SESSION] Could not clear sign-in:", error);
    }
  });
}

updateSigninInterface();