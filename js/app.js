let appState = {
  app: {
    name: "ClearPath",
    version: "0.2",
  },
  user: null,
  data: {
    features: [],
    feedback: [],
  },
  session: {
    startedAt: new Date().toISOString(),
  },
};

try {
  const savedState = sessionStorage.getItem("appState");

  if (savedState) {
    appState = JSON.parse(savedState);
  } else {
    appState.user = JSON.parse(sessionStorage.getItem("currentUser"));

    appState.data.feedback = JSON.parse(
      sessionStorage.getItem("feedbackRecords") || "[]",
    );
  }
} catch (error) {
  const sessionError = document.createElement("p");
  sessionError.className = "alert alert-danger";
  sessionError.setAttribute("role", "alert");
  sessionError.textContent =
    "Could not restore your saved session. Please close this tab and reopen the website.";

  document.body.prepend(sessionError);

  console.error("[SESSION] Could not restore application state:", error);
}

function saveAppState() {
  sessionStorage.setItem("appState", JSON.stringify(appState));
  console.log("[SESSION] Application state saved");
}
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
    const editingId = sessionStorage.getItem("feedbackToEdit");

    if (editingId) {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      const selectedRecord = feedbackRecords.find(function (record) {
        return record.id === editingId;
      });

      if (
        currentUser &&
        currentUser.authenticated === true &&
        currentUser.role === "admin" &&
        selectedRecord
      ) {
        document.getElementById("topic").value = selectedRecord.topic;
        document.getElementById("message").value = selectedRecord.message;
        feedbackForm.dataset.editingId = selectedRecord.id;

        feedbackForm.querySelector('button[type="submit"]').textContent =
          "Save changes";

        feedbackStatus.textContent = `Editing feedback submitted by ${selectedRecord.username}.`;
      } else {
        feedbackStatus.textContent =
          "Unable to open that feedback for editing.";
      }

      sessionStorage.removeItem("feedbackToEdit");
    }
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
          (existingRecord.username !== currentUser.username &&
            currentUser.role !== "admin")
        ) {
          feedbackStatus.textContent =
            "You are not authorized to edit this feedback.";
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

      appState.data.feedback = feedbackRecords;
      saveAppState();
      renderFeedback();
      feedbackForm.reset();
      delete feedbackForm.dataset.editingId;
      feedbackForm.querySelector('button[type="submit"]').textContent =
        "Submit feedback";

      if (editingId) {
        feedbackStatus.textContent = "Your feedback has been updated.";
        console.log("[UPDATE] Feedback updated:", editingId);
      } else {
        feedbackStatus.textContent = "Thank you. Your feedback has been saved.";
        console.log("[CREATE] Feedback added:", newRecord.id);
      }
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
      appState.user = currentUser;
      saveAppState();
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
      appState.user = null;
      saveAppState();
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
    if (appState.data.features.length > 0) {
      renderFeatures(appState.data.features);
      featuresStatus.textContent = "";
      console.log(
        `[DATA] Restored ${appState.data.features.length} features from session`,
      );
      return;
    }
    const response = await fetch("data/features.json");

    if (!response.ok) {
      throw new Error(`Could not load features: ${response.status}`);
    }

    const features = await response.json();
    appState.data.features = features;
    saveAppState();

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

      const adminRecords = JSON.parse(
        sessionStorage.getItem("feedbackRecords") || "[]",
      );
      appState.user = currentUser;
      appState.data.feedback = adminRecords;
      saveAppState();

      document.getElementById("admin-record-count").textContent =
        `${adminRecords.length} feedback record(s)`;

      const adminFeedbackList = document.getElementById("admin-feedback-list");
      adminFeedbackList.replaceChildren();

      adminRecords.forEach(function (record) {
        const card = document.createElement("div");
        card.className = "card card-body mb-3";

        const topic = document.createElement("h3");
        topic.className = "h6";
        topic.textContent = record.topicLabel;

        const author = document.createElement("p");
        author.textContent = `Submitted by: ${record.username}`;

        const message = document.createElement("p");
        message.className = "mb-0";
        message.textContent = record.message;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-outline-danger btn-sm mt-3";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
          try {
            const activeUser = JSON.parse(
              sessionStorage.getItem("currentUser"),
            );

            if (
              !activeUser ||
              activeUser.authenticated !== true ||
              activeUser.role !== "admin"
            ) {
              adminContent.hidden = true;
              adminStatus.textContent =
                "Only an administrator can delete feedback.";
              return;
            }

            const savedRecords = JSON.parse(
              sessionStorage.getItem("feedbackRecords") || "[]",
            );

            const remainingRecords = savedRecords.filter(function (item) {
              return item.id !== record.id;
            });

            sessionStorage.setItem(
              "feedbackRecords",
              JSON.stringify(remainingRecords),
            );

            appState.data.feedback = remainingRecords;
            saveAppState();
            card.remove();

            document.getElementById("admin-record-count").textContent =
              `${remainingRecords.length} feedback record(s)`;

            adminStatus.textContent = "Feedback deleted.";
            document.getElementById("app-state-output").textContent =
              JSON.stringify(appState, null, 2);

            const updatedStorage = {
              currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
              feedbackRecords: remainingRecords,
              appState: JSON.parse(sessionStorage.getItem("appState")),
            };

            document.getElementById("admin-storage").textContent =
              JSON.stringify(updatedStorage, null, 2);

            systemInfo.feedbackCount = remainingRecords.length;
            systemInfo.currentTime = new Date().toLocaleString();
            systemOutput.textContent = JSON.stringify(systemInfo, null, 2);
            console.log("[DELETE] Feedback removed:", record.id);
          } catch (error) {
            adminStatus.textContent =
              "Unable to delete feedback. Please try again.";
            console.error("[DELETE] Could not delete feedback:", error);
          }
        });

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "btn btn-outline-success btn-sm mt-3";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
          try {
            const activeUser = JSON.parse(
              sessionStorage.getItem("currentUser"),
            );

            if (
              !activeUser ||
              activeUser.authenticated !== true ||
              activeUser.role !== "admin"
            ) {
              adminContent.hidden = true;
              adminStatus.textContent =
                "Only an administrator can manage this feedback.";
              return;
            }

            sessionStorage.setItem("feedbackToEdit", record.id);
            window.location.href = "../index.html#feedback";
          } catch (error) {
            adminStatus.textContent = "Unable to open feedback for editing.";
            console.error("[UPDATE] Could not open feedback:", error);
          }
        });

        card.append(topic, author, message, editButton, deleteButton);
        adminFeedbackList.append(card);
      });
      document.getElementById("app-state-output").textContent = JSON.stringify(
        appState,
        null,
        2,
      );

      console.log("[STATE] Current application state:", appState);
      console.log(JSON.stringify(appState, null, 2));
      const storageSnapshot = {
        currentUser: JSON.parse(sessionStorage.getItem("currentUser")),
        feedbackRecords: JSON.parse(
          sessionStorage.getItem("feedbackRecords") || "[]",
        ),
        appState: JSON.parse(sessionStorage.getItem("appState")),
      };

      document.getElementById("admin-storage").textContent = JSON.stringify(
        storageSnapshot,
        null,
        2,
      );
      const systemInfo = {
        currentTime: new Date().toLocaleString(),
        currentPage: window.location.pathname,
        browser: navigator.userAgent,
        sessionStarted: appState.session.startedAt,
        featureCount: appState.data.features.length,
        feedbackCount: appState.data.feedback.length,
      };

      const systemOutput = document.createElement("pre");
      systemOutput.style.whiteSpace = "pre-wrap";
      systemOutput.style.overflowWrap = "anywhere";
      systemOutput.textContent = JSON.stringify(systemInfo, null, 2);

      document.getElementById("admin-system").replaceChildren(systemOutput);
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
const accountLink = document.querySelector('a[href="pages/signin.html"]');

if (accountLink) {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    accountLink.textContent =
      currentUser && currentUser.authenticated === true
        ? "Profile"
        : "Sign In";
  } catch (error) {
    accountLink.textContent = "Sign In";
  }
}