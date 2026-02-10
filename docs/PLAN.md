# Implementation Plan - Account Deletion Page

## Goal

Implement a public-facing "Delete Account" page that allows users to permanently delete their account using either:

1.  **Email + OTP verification**: Users receive a one-time code to their registered email.
2.  **Google Sign-In**: Users authenticate with Google to prove ownership.

This feature is critical for app store compliance (e.g., Apple/Google Play user data deletion requirements).

## User Review Required

> [!IMPORTANT]
> **Security Implication**: The OTP deletion flow allows account deletion without a password login. This is a standard pattern for "forgotten password but want to delete" scenarios, but relies entirely on email access security.
> **Data Loss**: Deletion is permanent and irreversible. The UI must have a strong warning.

## Proposed Changes

### Frontend (`bloodreq-admin`)

#### [NEW] [delete-account/page.tsx](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/src/app/delete-account/page.tsx)

- Create a new route `/delete-account`.
- UI Components:
  - **Header**: Title "Delete Account" and warning message about permanent data loss.
  - **Tabs/Toggle**: Switch between "Email Verification" and "Google Sign-In".
  - **Email Form**: Input for email, "Send Code" button. Replaces with OTP input and "Confirm Delete" button.
  - **Google Button**: "Sign in with Google to Delete Account".
- Logic:
  - OTP Flow: Call `/api/auth/request-deletion-otp` -> `/api/auth/confirm-deletion`.
  - Google Flow: Perform Firebase Google Auth locally -> Call `/api/profile` with `DELETE` method and `Authorization: Bearer <idToken>`.

### Backend (`bloodreq-admin`)

#### [NEW] [api/auth/request-deletion-otp/route.ts](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/src/app/api/auth/request-deletion-otp/route.ts)

- `POST`: Accepts `{ email }`.
- Logic:
  - Check if user exists in `users` collection.
  - If users exists: `generateOtp(email)` (reusing `lib/auth/otp-service`).
  - Send email using `sendEmail` (reusing `lib/email/email-service`) with subject "Account Deletion Code".
  - If user does not exist: Return success (security best practice to avoid email enumeration).

#### [NEW] [api/auth/confirm-deletion/route.ts](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/src/app/api/auth/confirm-deletion/route.ts)

- `POST`: Accepts `{ email, otp }`.
- Logic:
  - `verifyOtp(email, otp)` (reusing `lib/auth/otp-service`).
  - If valid:
    - Fetch user by `email`.
    - Delete from `users` collection (MongoDB).
    - Delete from `firebase-admin` (Auth).
    - Return success message.

#### [MODIFY] [lib/email/email-service.ts](file:///Users/snehashis/Projects/Blood%20Req/bloodreq-admin/src/lib/email/email-service.ts)

- Ensure the email template supports a generic "verification code" message or specific "deletion code" message if needed. (Assumed usage of generic HTML support based on `resend-otp` usage).

## Verification Plan

### Automated Tests

- Verify OTP generation and verification logic via unit tests (if test suite exists).

### Manual Verification

1.  **OTP Flow**:
    - Go to `/delete-account`.
    - Enter valid email.
    - Check email inbox for code.
    - Enter code.
    - Verify redirection to success state.
    - Check database: User document should be gone.
    - Check Firebase: User should be deleted.
2.  **Google Flow**:
    - Go to `/delete-account`.
    - Click "Sign in with Google".
    - Complete sign-in popup.
    - Verify account deletion.
3.  **Invalid Cases**:
    - Enter invalid OTP -> Error message.
    - Enter non-existent email -> Success message (UI) but no email sent (Backend).
