
const firestoreRulesCode = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isSuperAdmin() {
      return request.auth != null
        && request.auth.token.email == 'usamarehman112002@gmail.com'
        && request.auth.token.email_verified == true;
    }

    match /workers/{workerId} {
      allow read, create, update, delete: if isSuperAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;
