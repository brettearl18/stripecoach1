# Firestore Empty Collections Checklist (Pre-Launch)

Add these collections (with a dummy doc if needed) to future-proof your database and make expansion easy:

## 1. clientProgress (subcollection under each client)
- Path: `clients/{clientId}/clientProgress/{progressId}`
- Example doc: `{ initialized: true }`

## 2. files or uploads (subcollection under each user/client)
- Path: `users/{userId}/files/{fileId}` or `clients/{clientId}/uploads/{uploadId}`
- Example doc: `{ initialized: true }`

## 3. userActivity (subcollection under each user)
- Path: `users/{userId}/userActivity/{logId}`
- Example doc: `{ initialized: true }`

## 4. invites
- Path: `invites/{inviteId}`
- Example doc: `{ initialized: true }`

## 5. archived
- Path: `archived/{collectionName}/{docId}`
- Example doc: `{ initialized: true }`

## 6. preferences (subcollection under each user/client)
- Path: `users/{userId}/preferences/{preferenceId}`
- Example doc: `{ initialized: true }`

## 7. supportTickets
- Path: `supportTickets/{ticketId}`
- Example doc: `{ initialized: true }`

## 8. integrations
- Path: `integrations/{integrationId}`
- Example doc: `{ initialized: true }`

## 9. webhooks
- Path: `webhooks/{webhookId}`
- Example doc: `{ initialized: true }`

---

**Tip:** You can use the Firebase Console or a script to create these collections and add a dummy document to each. Remove the dummy docs before launch if you wish. 