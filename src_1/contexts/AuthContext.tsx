import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { userDb, studentsDb } from '../services/db/database.service';
import type { AppUser, StudentUser } from '../types/auth';
import { isAdminUser } from '../types/auth';

interface AuthContextType {
    user: AppUser | null;
    isLoading: boolean;
    isInitializing: boolean;
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
    const [isInitializing, setIsInitializing] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Flag to suppress auth listener hydration during signup
    // (Supabase fires SIGNED_IN before createStudent finishes writing the DB row)
    const isSigningUp = React.useRef(false);

    // Derived state
    const isAuthenticated = !!user;
    const isAdmin = isAdminUser(user);

    // ── Auto sign-out after 30 minutes of inactivity ───────────────────────────
    const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (improved from 2 min for better UX)
    useEffect(() => {
        if (!user) return; // only track when logged in

        let idleTimer: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(idleTimer);
            idleTimer = setTimeout(async () => {
                console.log('[AuthContext] Idle timeout — signing out');
                await supabase.auth.signOut();
                setUser(null);
                localStorage.removeItem('c2c_user');
                navigate('/login');
            }, IDLE_TIMEOUT_MS);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
        events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
        resetTimer(); // start the timer immediately

        // Also sign out when the tab/window is closed
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                // Store the time the tab was hidden
                sessionStorage.setItem('c2c_hidden_at', Date.now().toString());
            } else {
                // When tab becomes visible again, check how long it was hidden
                const hiddenAt = sessionStorage.getItem('c2c_hidden_at');
                if (hiddenAt) {
                    const elapsed = Date.now() - parseInt(hiddenAt);
                    sessionStorage.removeItem('c2c_hidden_at');
                    if (elapsed >= IDLE_TIMEOUT_MS) {
                        supabase.auth.signOut().then(() => {
                            setUser(null);
                            localStorage.removeItem('c2c_user');
                            navigate('/login');
                        });
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearTimeout(idleTimer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]); // re-run when user changes

    // Centralized Profile Resolution Strategy
    const lookupUserProfileByEmail = async (email: string): Promise<AppUser | null> => {
        try {
            return await userDb.lookupUserProfileByEmail(email);
        } catch (error: any) {
            // Re-throw QUERY_TIMEOUT so handleUserHydration can fall back to cache
            if (error?.message === 'QUERY_TIMEOUT') throw error;
            console.error("Error looking up user profile:", error);
            return null;
        }
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;
        let authTimeout: NodeJS.Timeout;

        // EMERGENCY SAFETY: If auth takes more than 15 seconds, force-stop loading
        authTimeout = setTimeout(() => {
            if (isInitializing) {
                console.warn('[AuthContext] Auth initialization timed out. Forcing load.');
                setIsInitializing(false);
            }
        }, 15000);

        const handleUserHydration = async (email: string) => {
            console.log(`[AuthContext] Hydrating profile for: ${email}`);
            try {
                // 1. Immediate local session state (prevents blank screen)
                const cachedUser = localStorage.getItem('c2c_user');
                if (cachedUser) {
                    try {
                        const parsed = JSON.parse(cachedUser);
                        if (parsed.email === email) setUser(parsed);
                    } catch (e) {
                    console.warn('[AuthContext] Failed to parse cached user from localStorage');
                }                }

                // 2. Fetch fresh profile from DB (with retry on timeout)
                try {
                    let freshProfile = await lookupUserProfileByEmail(email);

                    // If first attempt timed out, wait 2s and retry once
                    if (!freshProfile) {
                        await new Promise(r => setTimeout(r, 2000));
                        freshProfile = await lookupUserProfileByEmail(email);
                    }

                    if (freshProfile) {
                        console.log('[AuthContext] Profile fetched successfully');
                        setUser(freshProfile);
                        localStorage.setItem('c2c_user', JSON.stringify(freshProfile));
                    } else {
                        // Truly not found in DB -> Logout
                        console.warn(`[AuthContext] Genuinely no DB profile found for ${email}. Signing out.`);
                        await supabase.auth.signOut();
                        setUser(null);
                        localStorage.removeItem('c2c_user');
                    }
                } catch (err: any) {
                    if (err.message === 'QUERY_TIMEOUT') {
                        console.warn(`[AuthContext] Profile hydration timed out for ${email}. Staying with cached session.`);
                        // Cached user was already set above — don't sign out
                    } else {
                        console.error('[AuthContext] Hydration Error:', err);
                    }
                }
            } catch (error) {
                console.error('[AuthContext] Critical Hydration Error:', error);
            } finally {
                clearTimeout(authTimeout);
                setIsInitializing(false);
            }
        };

        // Auth State Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Supabase Auth] Event: ${event} | Session: ${session ? 'Active' : 'None'}`);

            // Skip hydration if signup is in progress — the signup function
            // handles setting the user itself after createStudent completes
            if (isSigningUp.current) {
                clearTimeout(authTimeout);
                setIsInitializing(false);
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
                if (session?.user?.email) {
                    await handleUserHydration(session.user.email);
                } else {
                    clearTimeout(authTimeout);
                    setIsInitializing(false);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('c2c_user');
                if (profileUnsubscribe) profileUnsubscribe();
                clearTimeout(authTimeout);
                setIsInitializing(false);
            } else {
                // Other events like USER_UPDATED, etc.
                clearTimeout(authTimeout);
                setIsInitializing(false);
            }
        });

        return () => {
            subscription.unsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
            clearTimeout(authTimeout);
        };
    }, []);

    // Student Login via SAP ID or Email (Supabase Auth)
    const login = async (sapIdOrEmail: string, password: string) => {
        setIsLoading(true);
        try {
            const isEmail = sapIdOrEmail.includes('@');
            let email: string;
            let userData: any;

            if (isEmail) {
                email = sapIdOrEmail.trim();
                userData = await userDb.lookupUserProfileByEmail(email);
            } else {
                // SAP ID — look up the student row to get their email
                const sapId = sapIdOrEmail.trim();
                userData = await userDb.getStudentDoc(sapId);

                if (!userData || !userData.email) {
                    // Retry once with a small delay in case of a transient timeout
                    await new Promise(r => setTimeout(r, 1500));
                    userData = await userDb.getStudentDoc(sapId);
                }

                if (!userData) {
                    throw new Error('No account found for this SAP ID. Please register first.');
                }
                if (!userData.email) {
                    throw new Error('Account found but no email linked. Please contact admin.');
                }
                email = userData.email;
            }

            // Validate we actually have a proper email before hitting Supabase Auth
            if (!email || !email.includes('@')) {
                throw new Error('Could not resolve a valid email. Please log in with your email address directly.');
            }

            // Authenticate with Supabase Auth
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            // Fetch fresh profile if we don't have it yet
            if (!userData) {
                userData = await userDb.lookupUserProfileByEmail(email);
            }

            if (userData) {
                setUser(userData);
                localStorage.setItem('c2c_user', JSON.stringify(userData));
            }
        } catch (error: any) {
            handleAuthError(error, 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    // Admin Login via Email (Supabase Auth)
    const adminLogin = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            const adminProfile = await lookupUserProfileByEmail(email);
            if (!adminProfile || !isAdminUser(adminProfile)) {
                await supabase.auth.signOut();
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

    // Student Signup Flow (Supabase Auth)
    const signup = async (data: any) => {
        setIsLoading(true);
        isSigningUp.current = true; // suppress auth listener during signup
        try {
            // 1. Create Auth Account in Supabase
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.fullName,
                        role: 'student',
                        sap_id: data.sapId
                    }
                }
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Signup failed: No user created');

            // 2. Upsert student row — handles both fresh signup and re-signup
            // (409 conflict on sap_id means the row already exists — update it instead)
            await studentsDb.createStudent({
                id: authData.user.id,
                sapId: data.sapId,
                name: data.fullName || data.name,
                email: data.email,
                phone: data.phone || '',
                branch: data.program || data.branch || '',
                rollNo: data.rollNo || '',
                currentYear: parseInt(data.currentYear) || 1,
                batch: '',
                cgpa: '0',
                careerDiscoveryCompleted: false,
                profileCompleted: false,
                assessmentCompleted: false,
                placementStatus: 'unplaced',
            });

            // 3. Build local user object and set session
            const defaultUser: StudentUser = {
                uid: authData.user.id,
                sapId: data.sapId,
                name: data.fullName || data.name,
                email: data.email,
                phone: data.phone || '',
                role: 'student',
                branch: data.program || data.branch || '',
                rollNo: data.rollNo || '',
                currentYear: parseInt(data.currentYear) || 1,
                onboardingStep: 0,
                program: data.program || data.branch || '',
                cgpa: '',
                careerDiscoveryCompleted: false,
                profileCompleted: false,
                assessmentCompleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setUser(defaultUser);
            localStorage.setItem('c2c_user', JSON.stringify(defaultUser));
        } catch (error: any) {
            handleAuthError(error, 'Signup failed. Please try again.');
        } finally {
            isSigningUp.current = false; // re-enable auth listener
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            localStorage.removeItem('c2c_user');
            // Force initializing to false to break out of any loading screens
            setIsInitializing(false);
            // Explicitly navigate to login
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            // Even if signOut fails, we want to clear local state
            setUser(null);
            localStorage.removeItem('c2c_user');
            setIsInitializing(false);
            navigate('/login');
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
            setUser(newUser);
            localStorage.setItem('c2c_user', JSON.stringify(newUser));

            const isStudent = !isAdminUser(newUser);
            const collectionName = isStudent ? 'students' : 'admins';
            // Use UUID (uid) as the primary key for Supabase — not SAP ID
            const docId = newUser.uid || (isStudent ? (newUser as StudentUser).sapId : newUser.email);

            if (!docId) {
                console.error('[updateUser] No docId found — uid is missing from user object', newUser);
                throw new Error('Cannot save: user ID is missing.');
            }

            console.log(`[updateUser] Saving to ${collectionName}/${docId}`, {
                internships: (newUser as any).internships?.length,
                projects: (newUser as any).projects?.length,
                techSkills: (newUser as any).techSkills?.length,
            });

            await userDb.updateUser(collectionName, docId, {
                ...newUser,
                updatedAt: new Date().toISOString()
            });

            console.log('[updateUser] Save successful');
        } catch (error: any) {
            console.error('Failed to update user in database:', error);
            throw error;
        }
    };

    const mockLogin = (role: string, name: string, email: string) => {
        if (import.meta.env.PROD) return;
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
        if (error.message === 'auth/unauthorized-role') {
            throw new Error('Access Denied: You do not have an administrative role.');
        }
        if (error.status === 422 || error.message?.includes('Unprocessable') || error.message?.includes('unable to validate')) {
            throw new Error('Login failed — could not resolve your account. Try logging in with your full email address instead of SAP ID.');
        }
        if (error.message?.includes('Invalid login credentials') || error.status === 400) {
            throw new Error('Incorrect credentials. Please check your email/SAP ID and password.');
        }
        if (error.message?.includes('Email not confirmed')) {
            throw new Error('Your email is not confirmed yet. Please check your inbox or contact admin to enable your account.');
        }
        if (error.message?.includes('Password should be') || error.message?.includes('password')) {
            throw new Error('Password must be at least 8 characters and contain letters and numbers.');
        }
        throw new Error(error.message || fallbackMessage);
    };

    return (
        <AuthContext.Provider value={{
            user, isLoading, isInitializing, isAuthenticated, isAdmin,
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
