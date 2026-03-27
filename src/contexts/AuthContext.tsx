import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { AppUser, StudentUser } from '../types/auth';
import { isAdminUser } from '../types/auth';

interface AuthContextType {
    user: AppUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (sapId: string, password: string) => Promise<void>;
    adminLogin: (email: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateUser: (newUser: AppUser) => Promise<void>;
    mockLogin: (role: string, name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Derived state
    const isAuthenticated = !!user;
    const isAdmin = isAdminUser(user);

    // Centralized Profile Resolution Strategy
    const lookupUserProfileByEmail = async (email: string): Promise<AppUser | null> => {
        try {
            // Check 'students' collection first
            let usersRef = collection(db, 'students');
            let q = query(usersRef, where('email', '==', email));
            let querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data() as AppUser;
            }

            // Fallback to 'admins' collection (for admins)
            usersRef = collection(db, 'admins');
            q = query(usersRef, where('email', '==', email));
            querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data() as AppUser;
            }

            return null;
        } catch (error) {
            console.error("Error looking up user profile:", error);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser?.email) {
                try {
                    // Fast path: load from localStorage to prevent UI flicker
                    const storedUser = localStorage.getItem('c2c_user');
                    if (storedUser) {
                        const parsed = JSON.parse(storedUser) as AppUser;
                        // Verify the stored user matches the Firebase session
                        if (parsed.email === firebaseUser.email) {
                            setUser(parsed);
                        }
                    }

                    // Background validation: always fetch fresh truth from Firestore
                    const freshProfile = await lookupUserProfileByEmail(firebaseUser.email);
                    if (freshProfile) {
                        setUser(freshProfile);
                        localStorage.setItem('c2c_user', JSON.stringify(freshProfile));
                    } else {
                        // Firebase auth exists, but no Firestore profile. Force logout.
                        console.warn("Firebase Auth valid, but no explicit Firestore profile found.");
                        await signOut(auth);
                        setUser(null);
                        localStorage.removeItem('c2c_user');
                    }
                } catch (error) {
                    console.error('Error hydrating user session:', error);
                }
            } else {
                setUser(null);
                localStorage.removeItem('c2c_user');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Student Login via SAP ID
    const login = async (sapId: string, password: string) => {
        setIsLoading(true);
        try {
            // Step 1: Look up student email by SAP ID in 'students' collection
            const userDoc = await getDoc(doc(db, 'students', sapId));
            if (!userDoc.exists()) {
                throw new Error('No account found for this SAP ID. Please register first.');
            }
            const userData = userDoc.data() as StudentUser;

            if (userData.role !== 'student') {
                throw new Error('Please use the Admin login portal.');
            }

            // Step 2: Authenticate with Firebase using the resolved email
            await signInWithEmailAndPassword(auth, userData.email, password);

            // Note: onAuthStateChanged will handle setting the state, but we can set it immediately for speed
            setUser(userData);
            localStorage.setItem('c2c_user', JSON.stringify(userData));
        } catch (error: any) {
            handleAuthError(error, 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Admin Login via Email directly
    const adminLogin = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // First authenticate with Firebase
            await signInWithEmailAndPassword(auth, email, password);

            // Then resolve the role from Firestore
            const adminProfile = await lookupUserProfileByEmail(email);

            if (!adminProfile) {
                await signOut(auth); // Rollback auth
                throw new Error('auth/no-access-profile');
            }

            if (!isAdminUser(adminProfile)) {
                await signOut(auth); // Rollback auth
                throw new Error('auth/unauthorized-role');
            }

            setUser(adminProfile);
            localStorage.setItem('c2c_user', JSON.stringify(adminProfile));
        } catch (error: any) {
            handleAuthError(error, 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Student Signup Flow
    const signup = async (data: any) => {
        setIsLoading(true);
        try {
            // 1. Create Auth Account
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            
            // 2. Prepare Default Student Data Structure
            const defaultUser: StudentUser = {
                uid: userCredential.user.uid,
                sapId: data.sapId,
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                role: 'student', // Default role
                branch: data.program,
                rollNo: '',
                currentYear: 1,
                onboardingStep: 0,
                program: data.program,
                cgpa: '',
                // Onboarding flags:
                careerDiscoveryCompleted: false, // Must complete career test
                profileCompleted: false,        // Must complete profile setup
                assessmentCompleted: false,     // Must complete initial assessment
                
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            // 3. Save into newly created 'students' collection
            await setDoc(doc(db, 'students', data.sapId), defaultUser);
            
            setUser(defaultUser);
            localStorage.setItem('c2c_user', JSON.stringify(defaultUser));
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('An account with this email already exists. Please sign in instead.');
            }
            throw new Error(error.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await signOut(auth);
            setUser(null);
            localStorage.removeItem('c2c_user');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        if (!user?.email) return;
        try {
            const freshProfile = await lookupUserProfileByEmail(user.email);
            if (freshProfile) {
                setUser(freshProfile);
                localStorage.setItem('c2c_user', JSON.stringify(freshProfile));
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const updateUser = async (newUser: AppUser) => {
        try {
            // Sync to local state
            setUser(newUser);
            localStorage.setItem('c2c_user', JSON.stringify(newUser));

            // Determine correct collection
            const collectionName = isAdminUser(newUser) ? 'admins' : 'students';
            const docId = isAdminUser(newUser) ? newUser.email : (newUser as StudentUser).sapId;

            // Sync with Firestore
            await setDoc(doc(db, collectionName, docId), {
                ...newUser,
                updatedAt: Date.now()
            }, { merge: true });

        } catch (error: any) {
            console.error('Failed to update user in database:', error);
            throw error;
        }
    };

    // ── Mock Login (DEV ONLY) ─────────────────────────────────
    const mockLogin = (role: string, name: string, email: string) => {
        if (import.meta.env.PROD) {
            console.warn('mockLogin is disabled in production.');
            return;
        }
        const mockUser: AppUser = {
            uid: `mock_${role}_${Date.now()}`,
            email,
            name,
            role: role as any,
            createdAt: new Date().toISOString(),
        };
        setUser(mockUser);
        localStorage.setItem('c2c_user', JSON.stringify(mockUser));
    };

    const handleAuthError = (error: any, fallbackMessage: string) => {
        // Custom explicit errors
        if (error.message === 'auth/no-access-profile') {
            throw new Error('No access profile found in the system for this email.');
        }
        if (error.message === 'auth/unauthorized-role') {
            throw new Error('Access Denied: You do not have an administrative role.');
        }
        // Firebase native errors
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Incorrect credentials. Please try again.');
        }
        if (error.code === 'auth/user-not-found') {
            throw new Error('No account found. Please contact system administrators.');
        }
        throw new Error(error.message || fallbackMessage);
    };

    return (
        <AuthContext.Provider value={{
            user, isLoading, isAuthenticated, isAdmin,
            login, adminLogin, signup, logout, refreshUser, updateUser, mockLogin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
