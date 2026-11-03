const feedbackForm = document.getElementById("feedback-form");
const feedbackStatus = document.getElementById("feedback-status");
const feedbackList = document.getElementById("feedback-list");

let feedbackRecords = [];

function renderFeedback() {
  feedbackList.replaceChildren();

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

  if (!currentUser || !currentUser.authenticated) {
    feedbackList.textContent = "Sign in to view and submit your feedback.";
    return;
  }

  const ownFeedback = feedbackRecords.filter(function (record) {
    return record.username === currentUser.username;
  });

  if (ownFeedback.length === 0) {
    feedbackList.textContent = "You have not submitted feedback yet.";
    return;
  }

  ownFeedback.forEach(function (record) {
    const card = document.createElement("div");
    card.className = "card card-body mb-3";

    const topic = document.createElement("h4");
    topic.className = "h6";
    topic.textContent = record.topicLabel;

    const message = document.createElement("p");
    message.className = "mb-0";
    message.textContent = record.message;

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "btn btn-outline-success btn-sm mt-3";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
      document.getElementById("topic").value = record.topic;
      document.getElementById("message").value = record.message;
      feedbackForm.dataset.editingId = record.id;

      feedbackForm.querySelector('button[type="submit"]').textContent =
        "Save changes";

      feedbackStatus.textContent = "Editing your feedback.";
      document.getElementById("message").focus();
    });

    card.append(topic, message, editButton);
    feedbackList.append(card);
  });
}

if (feedbackForm && feedbackStatus && feedbackList) {
  try {
    const savedFeedback = sessionStorage.getItem("feedbackRecords");

    if (savedFeedback) {
      feedbackRecords = JSON.parse(savedFeedback);

      if (!Array.isArray(feedbackRecords)) {
        throw new Error("Saved feedback must be an array.");
      }
    }

    renderFeedback();
  } catch (error) {
    feedbackStatus.textContent = "Could not load your saved feedback.";
    console.error("[DATA] Could not load feedback:", error);
  }

  feedbackForm.addEventListener("submit", function (event) {
    event.preventDefault();

    try {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      if (!currentUser || !currentUser.authenticated) {
        feedbackStatus.textContent =
          "Please sign in before submitting feedback.";
        return;
      }

      const topicInput = document.getElementById("topic");
      const messageInput = document.getElementById("message");
      const message = messageInput.value.trim();

      if (!topicInput.value || !message) {
        feedbackStatus.textContent = "Choose a topic and enter your feedback.";
        return;
      }

      const newRecord = {
        id: crypto.randomUUID(),
        username: currentUser.username,
        topic: topicInput.value,
        topicLabel: topicInput.options[topicInput.selectedIndex].text,
        message: message,
        createdAt: new Date().toISOString(),
      };

      const editingId = feedbackForm.dataset.editingId;
      let updatedRecords;

      if (editingId) {
        const existingRecord = feedbackRecords.find(function (record) {
          return record.id === editingId;
        });

        if (
          !existingRecord ||
          existingRecord.username !== currentUser.username
        ) {
          feedbackStatus.textContent = "You can only edit your own feedback.";
          return;
        }

        updatedRecords = feedbackRecords.map(function (record) {
          if (record.id === editingId) {
            return {
              ...record,
              topic: newRecord.topic,
              topicLabel: newRecord.topicLabel,
              message: newRecord.message,
              updatedAt: new Date().toISOString(),
            };
          }

          return record;
        });
      } else {
        updatedRecords = [...feedbackRecords, newRecord];
      }

      sessionStorage.setItem("feedbackRecords", JSON.stringify(updatedRecords));

      feedbackRecords = updatedRecords;
      renderFeedback();
      feedbackForm.reset();
      delete feedbackForm.dataset.editingId;
      feedbackForm.querySelector('button[type="submit"]').textContent =
        "Submit feedback";

      feedbackStatus.textContent = "Thank you. Your feedback has been saved.";
      console.log("[CREATE] Feedback added:", newRecord.id);
    } catch (error) {
      feedbackStatus.textContent = "Unable to save feedback. Please try again.";
      console.error("[CREATE] Could not save feedback:", error);
    }
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
    const adminLink = document.getElementById("admin-link");

    if (adminLink) {
      adminLink.hidden = !(signedIn && currentUser.role === "admin");
    }

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

const cardsContainer = document.getElementById("cards");
const featuresStatus = document.getElementById("features-status");

function renderFeatures(features) {
  cardsContainer.replaceChildren();

  features.forEach(function (feature) {
    const column = document.createElement("div");
    column.className = "col-md-4";

    const card = document.createElement("div");
    card.className = "card h-100";

    const body = document.createElement("div");
    body.className = "card-body";

    const icon = document.createElement("i");
    icon.className = `bi ${feature.icon} feature-icon`;
    icon.setAttribute("aria-hidden", "true");

    const title = document.createElement("h3");
    title.className = "h5";
    title.textContent = feature.title;

    const description = document.createElement("p");
    description.textContent = feature.description;

    const audiences = document.createElement("p");
    audiences.className = "text-success";
    audiences.textContent = feature.audiences.join(" - ");

    body.append(icon, title, description, audiences);
    card.append(body);
    column.append(card);
    cardsContainer.append(column);
  });
}

async function loadFeatures() {
  featuresStatus.textContent = "Loading features...";

  try {
    const response = await fetch("data/features.json");

    if (!response.ok) {
      throw new Error(`Could not load features: ${response.status}`);
    }

    const features = await response.json();

    renderFeatures(features);

    featuresStatus.textContent =
      features.length === 0 ? "No features found." : "";

    console.log(`[DATA] Loaded ${features.length} features`);
  } catch (error) {
    featuresStatus.textContent = "Could not load features. Please try again.";

    console.error("[DATA] Feature loading failed:", error);
  }
}

if (cardsContainer && featuresStatus) {
  loadFeatures();
}

const adminContent = document.getElementById("admin-content");
const adminStatus = document.getElementById("admin-status");

if (adminContent && adminStatus) {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    if (
      currentUser &&
      currentUser.authenticated === true &&
      currentUser.role === "admin"
    ) {
      adminContent.hidden = false;
      adminStatus.textContent = "Welcome to the ClearPath admin dashboard.";

      document.getElementById("admin-user").textContent =
        `Username: ${currentUser.username} | ` +
        `Role: ${currentUser.role} | Authenticated: true`;

      console.log("[AUTHZ] Admin access allowed");
    } else {
      adminContent.hidden = true;
      adminStatus.textContent =
        "You are not authorized to access this dashboard. Sign in as an administrator.";

      console.log("[AUTHZ] Admin access denied");
    }
  } catch (error) {
    adminContent.hidden = true;
    adminStatus.textContent =
      "Unable to load your session. Please sign in again.";
    console.error("[SESSION] Admin session could not be loaded:", error);
  }
}
