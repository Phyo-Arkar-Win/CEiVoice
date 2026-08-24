# CEiVoice Backend Finish Checklist

Use this checklist before the final backend handoff.

## P0: Fix Before Demo

### Authorization and data access

- [ ] Add `protect` and `restrictTo` to admin and assignee routes.
- [ ] Protect draft listing, draft editing, draft submission, merge, unlink, ticket submission, and ticket update endpoints.
- [ ] Protect the comments endpoint. The handler expects `req.user`, but the route currently allows unauthenticated requests.
- [ ] Restrict users to tickets they created or follow when loading ticket details.
- [ ] Restrict assignees to tickets assigned to them where appropriate.
- [ ] Protect history-log routes and query with `req.user._id` instead of the complete user document.
- [ ] Protect scope creation; only administrators should be able to create scopes.
- [ ] Remove or protect development endpoints under `/api/v1/test` and `/api/v1/ai`.

### Ticket workflow correctness

- [ ] Fix `trackTicket` so guest responses return immediately. The current flow continues to `req.user.role` after responding.
- [ ] Add explicit handling for unsupported roles in ticket list and tracking handlers.
- [ ] Fix `updateTicket`: assign `ticket.status = status` before saving. `updateFields.status` is currently never applied.
- [ ] Authenticate and authorize `updateTicket`; it must not allow arbitrary users to mutate arbitrary tickets.
- [ ] Validate allowed status transitions and require a valid comment before solving.
- [ ] Ensure reassignment stores user IDs, replaces or deduplicates assignees correctly, and only accepts users with the `assignee` role.
- [ ] Require `status === 'Draft'` inside `updateDraftTicket`.
- [ ] Validate draft fields before saving: title, summary, category, resolution path, assignee, and deadline.

### Merge workflow

- [ ] Complete merge persistence: save the merged ticket, mark it as `New`, and handle source tickets according to the intended product behavior.
- [ ] Define or import `mergedSourceIds`; it is currently referenced after its declaration was commented out.
- [ ] Remove the commented-out merge implementation and replace it with one tested transaction or clearly ordered workflow.
- [ ] Validate that merge input contains at least two existing Draft tickets loaded from MongoDB.
- [ ] Do not trust complete ticket objects supplied by the client for issue, creator, followers, or source IDs.
- [ ] Make unlink persist the updated merge state instead of returning only a client-generated document.
- [ ] Send update emails to the correct creators/followers after a successful merge.

### Authentication and sensitive data

- [ ] Never return password hashes or refresh-token arrays in login, signup, or Google-login responses.
- [ ] Validate and normalize email addresses and usernames.
- [ ] Validate Google tokens and configure a real Google client ID in each environment.
- [ ] Rotate refresh tokens on refresh and bound the number of tokens stored per user.
- [ ] Verify cookie behavior in production, including `secure`, `sameSite`, domain, and clearing options.

## P1: Finish If Time Allows

### Validation and errors

- [ ] Add request validation for email, issue text, comment text, IDs, deadlines, status values, and AI responses.
- [ ] Add a centralized Express error handler.
- [ ] Avoid returning raw database, email, or integration error messages to clients.
- [ ] Return consistent response shapes and status codes across controllers.
- [ ] Handle missing tickets before dereferencing `ticket.creator` or `ticket.updatedAt`.
- [ ] Remove debug logging and unused imports/routes.

### External services

- [ ] Fix Ollama route wiring. Service functions currently expect ordinary arguments but are registered directly as Express handlers.
- [ ] Fix the Ollama merge controller call signature.
- [ ] Add timeout and failure handling for Ollama, embeddings, Atlas Vector Search, and email.
- [ ] Define/import `ticketToEmbeddingText` for draft updates.
- [ ] Decide whether email delivery failure should fail the API request. Prefer queueing or a retryable delivery status.
- [ ] Escape user-controlled values before inserting them into HTML email templates.
- [ ] Confirm the Atlas Vector Search index exists and matches the configured embedding dimensions.

### Security and operations

- [ ] Add an explicit JSON body-size limit.
- [ ] Add security headers such as Helmet or an equivalent configuration.
- [ ] Restrict CORS to the expected frontend origins instead of relying on a single fallback value.
- [ ] Add startup validation for `MONGO_URI`, JWT secrets, email credentials, frontend URL, Google configuration, and Ollama configuration.
- [ ] Add graceful shutdown for the HTTP server and MongoDB connection.
- [ ] Add database indexes for ticket status/creator/followers, comments by ticket, and history by assignee.
- [ ] Review rate limits for login, signup, guest tracking, ticket creation, and AI endpoints.

## P1: Testing Gate

- [ ] Replace the placeholder `npm test` script. It currently exits with code 1 because no tests are configured.
- [ ] Add authentication tests: signup, duplicate signup, login failure, logout, access-token refresh, and invalid refresh token.
- [ ] Add authorization tests for every admin, assignee, and user endpoint.
- [ ] Add ticket ownership tests to prevent IDOR access.
- [ ] Add guest tracking tests for valid email, invalid email, invalid ID, and missing fields.
- [ ] Add comment tests for public/internal visibility, missing text, ownership, and unauthenticated requests.
- [ ] Add status-transition tests, including the comment-before-solve rule.
- [ ] Add draft submission and draft-update tests.
- [ ] Add merge and unlink tests, including persistence and cleanup of related-ticket links.
- [ ] Mock Ollama, email, embeddings, and Atlas services in controller tests.
- [ ] Add a health-check and startup smoke test.

## Manual End-to-End Verification

- [ ] Start MongoDB and the backend using the intended environment configuration.
- [ ] Verify signup and login for user, admin, and assignee accounts.
- [ ] Submit a user request and verify the confirmation email and draft creation.
- [ ] Verify background embedding and related-ticket calculation, or confirm the documented fallback behavior.
- [ ] Review and edit a draft as an admin.
- [ ] Merge two drafts, unlink one source ticket, and verify database state after each action.
- [ ] Submit a draft as a New ticket and verify assignment, deadline, cleanup, and email notification.
- [ ] Add public and internal comments with the correct roles.
- [ ] Reassign a ticket and verify the assignee history log.
- [ ] Move a ticket through Solving, Solved, and Failed states and verify notification behavior.
- [ ] Track a ticket as a guest using the correct and incorrect email addresses.
- [ ] Refresh an expired access token and verify logout invalidates the refresh token.
- [ ] Confirm unauthorized users receive `401` or `403`, never `500`, and cannot read or mutate other users' tickets.

## Final Release Checks

- [ ] Run `npm test` from `backend/` and confirm it passes.
- [ ] Run syntax checks over all backend JavaScript files.
- [ ] Run the frontend against the backend and verify browser console and network errors are clear.
- [ ] Confirm no secrets, `.env` files, credentials, password hashes, or refresh tokens are committed.
- [ ] Confirm production CORS, cookies, database, email, AI, and Atlas settings.
- [ ] Record known limitations and the required external services in the project documentation.
