import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback, useMemo } from 'react';
// firebase
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  AuthErrorCodes,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
// config
import { FIREBASE_API, BASE_URL } from '../config';
import { PATH_AUTH, PATH_DASHBOARD } from '../routes/paths';
// api
import axios from '../utils/axios';

// ----------------------------------------------------------------------

const initialState = {
  isInitialized: false,
  isAuthenticated: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      isInitialized: true,
      isAuthenticated: action.payload.isAuthenticated,
      user: action.payload.user,
    };
  } if (action.type === 'UPDATE_TEAM_DETAILS') {
    return {
      ...state,
      user: {
        ...state.user,
        teamId: action.payload.teamId,
        role: action.payload.role,
        company: action.payload.teamName,
        type: action.payload.type,
      },
    };
  } if (action.type === 'UPDATE_USER_PROFILE') {
    return {
      ...state,
      user: {
        ...state.user,
        displayName: action.payload.displayName,
        photoURL: action.payload.photoURL,
        phoneNumber: action.payload.phoneNumber,
        role: action.payload.role,
      },
    };
  } if (action.type === 'UPDATE_MEMBER_PROFILE_BY_ADMIN') {
    return {
      ...state,
      user: {
        ...state.user,
        displayName: action.payload.name,
        photoURL: action.payload.avatarUrl,
        phoneNumber: action.payload.phoneNumber,
        role: action.payload.role,
      },
    };
  }

  return state;
};

// ----------------------------------------------------------------------

export const AuthContext = createContext(null);

// ----------------------------------------------------------------------

const firebaseApp = initializeApp(FIREBASE_API);

const AUTH = getAuth(firebaseApp);

const DB = getFirestore(firebaseApp);

const GOOGLE_PROVIDER = new GoogleAuthProvider();

const GITHUB_PROVIDER = new GithubAuthProvider();

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(() => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          const userRef = doc(DB, 'users', user.uid);
          const docSnap = await getDoc(userRef);          
          const profile = docSnap.data();

          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: true,
              user: {
                ...user,
                ...profile,
              },
            },
          });
        } else {
          dispatch({
            type: 'INITIAL',
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    await signInWithEmailAndPassword(AUTH, email, password);
  }, []);

  const loginWithGoogle = useCallback(() => {
    signInWithPopup(AUTH, GOOGLE_PROVIDER);
  }, []);

  const loginWithGithub = useCallback(() => {
    signInWithPopup(AUTH, GITHUB_PROVIDER);
  }, []);

  // REGISTER
  const register = useCallback(async (
    email,
    password,
    firstName,
    lastName,
    teamId = null,
    company = null,
    role = null,
    type = null,
    memberId = null
  ) => {
    await createUserWithEmailAndPassword(AUTH, email, password).then(async (res) => {
      if (memberId && teamId) {
        await axios.put(`/members/${memberId}?teamId=${teamId}`, { uid: res.user?.uid });
      }

      const userRef = doc(collection(DB, 'users'), res.user?.uid);
      await setDoc(userRef, {
        email,
        teamId,
        company,
        role,
        type,
        uid: res.user?.uid,
        displayName: `${firstName} ${lastName}`,
      });
    }).catch((error) => {
      console.log(error);
    });
  }, []);

  // LOGOUT
  const logout = useCallback(() => {
    signOut(AUTH);
  }, []);

  // reset password
  const resetPassword = useCallback(async (email) => {    
    try {
      const actionCodeSettings = {
        url: BASE_URL + PATH_AUTH.login,
        handleCodeInApp: false
      };
      await sendPasswordResetEmail(AUTH, email, actionCodeSettings);
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };

    } catch (error) {
      const errorCode = error.code;
      let errorMessage = 'Error sending password reset email. Please try again later.';

      switch (errorCode) {
        case AuthErrorCodes.USER_NOT_FOUND:
          errorMessage = 'User with this email address not found.';
          break;
        case AuthErrorCodes.TOO_MANY_REQUESTS:
          errorMessage = 'Too many password reset requests. Please try again later.';
          break;
        default:
          break;
      }

      return {
        success: false,
        message: errorMessage,
      }
    }
  }, []);

  // Change Password
  const changePassword = useCallback(async (data) => {
    // Get the current user from Firebase Authentication
    const user = AUTH.currentUser;

    // Create a credential with the user's email and old password
    const credential = EmailAuthProvider.credential(user.email, data.oldPassword);

    try {
      // Re-authenticate the user with the old password
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, update the user's password
      await updatePassword(user, data.newPassword);
      return {
        success: true,
        message: 'Password changed successfully!',
      };
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        return {
          success: false,
          message: 'Incorrect old password. Please try again.',
        };
      } 
        return {
          success: false,
          message: 'Error updating password. Please try again later.',
        };
      
    }
  }, []);

    // Verifying email
  const verifyEmail = useCallback(async () => {  
    try {
      const actionCodeSettings = {
        url: BASE_URL + PATH_DASHBOARD.general.app,
        handleCodeInApp: false
      };

      const user = AUTH.currentUser;
      if (user) {
        // Send the verification email
        await sendEmailVerification(user, actionCodeSettings);

        // Return an object with success=true and a success message
        return {
          success: true,
          message: 'Verification code sent. Please check your email.',
        };
      } 
        // Return an object with success=false and an error message
        return {
          success: false,
          message: 'No user is currently signed in.',
        };
      
    } catch (error) {
      // Return an object with success=false and the error message
      return {
        success: false,
        message: `Error sending verification code: ${  error.message}`,
      };
    }
  }, []);

  // Update team id and user role after signup and/or team creation
  const setTeamAndRoleInUser = useCallback(async (teamId, role, teamName, type) => {
    // Get the current user from Firebase Authentication
    const user = AUTH.currentUser;

    try {
      const userRef = doc(DB, 'users', user.uid);
      await updateDoc(userRef, {
        teamId,
        role,
        company: teamName,
        type,
      });

      dispatch({
        type: 'UPDATE_TEAM_DETAILS',
        payload: {
          teamId,
          role,
          teamName,
          type,
        },
      });

      return {
        success: true,
        message: "Team and role details updated."
      }

    } catch (err) {
      console.error(err)

      return {
        success: false,
        message: "Error in updating the details."
      }
    }
  }, []);

  // Update user profile
  const updateUserProfile = useCallback(async (profileData) => {
    // Get the current user from Firebase Authentication
    const user = AUTH.currentUser;

    console.log('current profile data -> ', profileData);

    try {
      const photoUrlPreview = profileData.photoURL?.preview || "";
      // Update user profile fields in Firebase Authentication
      await updateProfile(user, {
        displayName: profileData.displayName,
        photoURL: photoUrlPreview,
      });

      // Update custom fields in Firestore
      const userRef = doc(DB, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: profileData.phoneNumber,
        role: profileData.role,
      });

      dispatch({
        type: 'UPDATE_USER_PROFILE',
        payload: profileData,
      });

    } catch (err) {
      console.error(err)
    }
  }, []);

  // Update member's firebase details in case admin updates
  const updateMemberByAdmin = useCallback(async (uid, profileData) => {
    try {
      const photoUrlPreview = profileData.avatarUrl?.preview || "";
      const userRef = doc(DB, 'users', uid);

      await updateDoc(userRef, {
        displayName: profileData.name,
        photoURL: photoUrlPreview,
        phoneNumber: profileData.phoneNumber,
        role: profileData.role,
      });

      dispatch({
        type: 'UPDATE_MEMBER_PROFILE_BY_ADMIN',
        payload: profileData,
      });

      console.log('User display name updated successfully');
    } catch (error) {
      console.error('Error updating user display name:', error);
    }
  }, []);

  // // Function to delete a user's account
  // async function deleteUser(uid) {
  //   try {
  //     await AUTH.deleteUser(uid);
  //     console.log('Member account deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting member account:', error);
  //   }
  // }

  // Function to delete a member's data in Firestore
  async function deleteMemberData(uid) {
    try {
      const memberRef = doc(DB, 'users', uid);
      await deleteDoc(memberRef);
      console.log('Member data deleted from Firestore');
    } catch (error) {
      console.error('Error deleting member data from Firestore:', error);
    }
  }

  // Callback function to delete user account and member data
  const deleteUserProfile = useCallback(async (uid) => {
    try {
      // await deleteUser(uid);
      await deleteMemberData(uid);
    } catch (error) {
      console.error('Error deleting user profile:', error);
    }
  }, []);

  const deleteMultipleUsers = useCallback(async (memberIds) => {
    try {
      await Promise.all(memberIds?.map(async (memberId) => {
        await deleteMemberData(memberId);
      }));
      console.log('Multiple members deleted successfully');
    } catch (error) {
      console.error('Error deleting multiple members:', error);
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      isInitialized: state.isInitialized,
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      method: 'firebase',
      login,
      loginWithGoogle,
      loginWithGithub,
      register,
      logout,
      changePassword,
      setTeamAndRoleInUser,
      resetPassword,
      verifyEmail,
      updateUserProfile,
      updateMemberByAdmin,
      deleteUserProfile,
      deleteMultipleUsers,
    }),
    [
      state.isAuthenticated,
      state.isInitialized,
      state.user,
      login,
      loginWithGithub,
      loginWithGoogle,
      register,
      logout,
      changePassword,
      setTeamAndRoleInUser,
      resetPassword,
      verifyEmail,
      updateUserProfile,
      updateMemberByAdmin,
      deleteUserProfile,
      deleteMultipleUsers,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
