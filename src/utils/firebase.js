export const mapFirebaseErrorToMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return "User not found";
    case 'auth/email-already-in-use':
      return "A user with this email already exists.";
    case 'auth/account-exists-with-different-credential':
      return "Email is already registered. Please sign in with your existing method";
    case 'auth/wrong-password':
      return "The password entered is incorrect.";
    case 'auth/too-many-requests':
      return "Too many signup requests. Please try again later.";
    case 'auth/unauthorized':
      return error.message;
    case 'auth/missing-fields':
      return "Please provide all required information.";
    case 'auth/weak-password':
      return "Weak password. Please use a stronger password.";
    default:
      return "Error signing in. Please try again later.";
  }
};