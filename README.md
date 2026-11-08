# ClearPath

> Making way for what matters most. Together.

Author: Camdyn Mardis | Project: dev-delta | Version: 0.2 | Date: 2026-11-07

## Problem and narrative

Drivers, emergency responders, and city planners need a place to learn about ClearPath and share questions or suggestions.

ClearPath is a proposed system that could connect emergency vehicles, nearby drivers, and traffic signals to support emergency response. This website explains emergency-vehicle alerts, automatic signaling, and intersection coordination. It does not control traffic signals or send emergency alerts.

Delta builds on the existing Bravo website by adding test authentication, role-based controls, JSON feature data, feedback management, and session storage.

## User stories

As a driver unfamiliar with ClearPath, I want to learn about its proposed emergency alerts so that I can understand how the system could help me notice an approaching emergency vehicle.

As a signed-in user, I want to submit and edit my feedback so that I can share questions and suggestions.

As an administrator, I want to view, edit, and delete feedback and inspect application state so that I can manage the prototype.

## Current functionality

### Authentication (AuthN)

- Two fake test accounts: an administrator and a regular user.
- Test usernames and passwords are printed in the browser console.
- Sign-in checks the entered username and password.
- Successful sign-in saves the username, authenticated status, and role.
- The interface displays the signed-in username and provides sign-out.
- Sign-out removes the current user and clears the user in application state.

These accounts are for front-end development only. They do not provide production authentication. Do not use real passwords.

### Authorization (AuthZ)

- Regular users can create, read, and edit their own feedback.
- Administrators can view all feedback, edit it, and delete records.
- The admin dashboard link is shown only to signed-in administrators.
- JavaScript checks the current role before displaying the dashboard and before admin edit and delete actions.

These browser-side checks demonstrate authorization concepts. They are not server-side security.

### JSON and feature data

The three ClearPath feature records are stored in `data/features.json`.

JavaScript fetches and parses the starting JSON, then creates the feature cards in the DOM. Saved feature data is restored from application state during the session.

### Feedback CRUD

- Create: submit a topic and message through the feedback form.
- Read: view your feedback; administrators can view all records.
- Update: edit your own feedback; administrators can edit any record.
- Delete: administrators can remove feedback through the dashboard.

Feedback records include an ID, author, topic, message, creation time, and an update time when edited.

### Session storage and application state

The prototype uses `sessionStorage` as temporary browser storage.

- `currentUser` stores the signed-in user.
- `feedbackRecords` stores submitted feedback.
- `appState` combines app information, user information, feature data, feedback, and the session start time.
- `feedbackToEdit` temporarily identifies a record opened for editing from the dashboard.

Changes survive page refreshes during the browser session. This is not a shared database, and feedback is not sent to a server.

### Admin dashboard

The dashboard provides:

- Current username, role, and authenticated status.
- Feedback records and a record count.
- Add, edit, and delete controls.
- A display of the app's session-storage entries.
- Formatted application-state JSON.
- Current time, page path, browser information, session start, and record counts.

## Data flow

```text
Test sign-in ------------------+
                               |
features.json -- fetch() ------+--> appState --> sessionStorage
                               |       |
Feedback form and CRUD --------+       +--> DOM
```

Sign-in supplies user and role information. The JSON file supplies starting feature data. User input creates or updates feedback. Admin deletion removes feedback. JavaScript saves the resulting state and updates the interface.

## Technology stack

HTML5, CSS3, JavaScript, jQuery 3.7.1, Bootstrap 5.3.8, Bootstrap Icons 1.11.3, Normalize.css 8.0.1, Google Fonts (Inter), Git, GitHub, and GitHub Pages.

I used Visual Studio Code to edit the project and a local development server to test it. A server is needed for fetching the JSON file.

## Project structure

```text
clearpath-system-website/
|-- index.html
|-- README.md
|-- css/
|   |-- styles.css
|-- data/
|   |-- features.json
|-- js/
|   |-- app.js
|-- pages/
|   |-- signin.html
|   |-- admin.html
|-- img/
    |-- clearpath-hero.png
```

The Bravo version is preserved in Git with the `dev-bravo` tag.

## Testing

The following behavior was manually checked on the local development server:

- Admin and regular-user credentials allow sign-in.
- Incorrect credentials display a failure message.
- Sign-out returns the sign-in form and blocks direct admin-page access.
- Regular users do not see the admin dashboard link.
- Administrators can open the dashboard through the interface.
- Three feature records load from JSON and render as cards.
- Saved features are restored from session state.
- Feedback can be created and edited without duplicate records.
- Feedback remains after a page refresh.
- Saved application state contains the edited feedback message.
- Administrators can edit another user's feedback while preserving its author.
- Admin deletion removes feedback and updates the record count, state JSON, storage display, and system count without a refresh.
- The console displays test credentials and meaningful data, authentication, and CRUD messages.

### Checks still to complete

- Test the latest version on deployed GitHub Pages.
- Test starting with a fresh browser session.
- Check keyboard navigation and smaller-screen layouts.
- Check text readability and HTML validation.
- Review error handling and the browser console.
- Complete a final comparison against the Delta requirements.

## Known issues and limitations

- Search and audience-filter controls remain placeholders.
- Authentication and authorization run entirely in the browser.
- Test credentials are intentionally visible.
- Session data is temporary and is not shared between users or devices.
- There is no server database or real account registration.
- Separate storage entries and application state must remain synchronized.
- Browser testing showed messages from external scripts; their source needs further review during final testing.

## Future development

- Add a server database and server-side authentication and authorization.
- Make feature search and audience filters functional.
- Support feedback management across users and devices.

## Attribution

- Classmates: Discussed assignment requirements and project ideas.
- Codecademy: Referenced JavaScript lessons.
- W3Schools: Referenced HTML and CSS examples.
- AI assistance: Used ChatGPT/Codex for coding help, troubleshooting, and documentation.
- Libraries and resources: Bootstrap, Bootstrap Icons, jQuery, Normalize.css, and Google Fonts.
- Hero image: Created with Canva AI.