# AWS-Web-Class

A simple classifieds web app built with plain HTML, CSS, and JavaScript.

## Features

- Register with username, email, password, and U.S. state (continental states + Hawaii).
- Login/logout with local browser storage.
- `Post an Ad` stays hidden until:
  - user logs in, and
  - user clicks `Enter Profile`.
- Profile contact fields for phone and email (email is required).
- Account recovery drafts an email containing the username and a password reset link (demo behavior; see note below).
- Ads are filtered by the logged-in user's state.
- Ads are displayed newest to oldest.

## Project Files

- `index.html` - App layout and forms
- `styles.css` - Styling
- `app.js` - Registration, login, profile gating, and ad logic

## Run Locally

No build tools are required.

1. Open `index.html` in a browser.
2. Register a user.
3. Log in.
4. Click `Enter Profile`.
5. Post ads and view state-based listings.

## Data Storage

The app stores data in browser `localStorage`:

- `classified_users`
- `classified_current_user`
- `classified_profile_active`
- `classified_ads`
- `classified_password_reset` (temporary reset token for the demo recovery flow)

To reset data, clear local storage for the site in your browser.

## Account recovery note

This project is a static frontend. The recovery button uses `mailto:` to open your email client with a pre-filled message that includes:

- your username
- a reset link using the page URL hash (`#reset=...`)

A production app needs a backend + email provider to send messages automatically and to store reset tokens securely server-side.

## Publish with GitHub Pages

1. Push your code to `main`.
2. In GitHub: `Settings` -> `Pages`.
3. Under **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save.

Your live URL:

[https://rorhoff.github.io/AWS-Web-Class/](https://rorhoff.github.io/AWS-Web-Class/)
