# Firebase Storage Rules: Go-Live Checklist

## 1. Development/Testing Rules (Temporary)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
- Use these rules **only for local development and testing**.
- They allow anyone to read/write to your storage bucket.

---

## 2. Secure Rules for Production (Go-Live)
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
- **Update to these rules before going live!**
- Only authenticated users can read/write to storage.

---

## 3. Steps to Update
1. Go to Firebase Console → Storage → Rules
2. Replace the rules with the production version above
3. Click **Publish**
4. Test your app to ensure uploads/downloads work for authenticated users

---

## 4. Optional: Advanced Security
- Restrict by user, file path, or custom claims for more control
- See [Firebase Storage Security Docs](https://firebase.google.com/docs/storage/security) for details

---

**Always lock down your storage before launch to protect user data!** 