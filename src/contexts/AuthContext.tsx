import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userDb } from '../services/db/database.service';
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
            return await userDb.lookupUserProfileByEmail(email);
        } catch (error) {
            console.error("Error looking up user profile:", error);
            return null;
        }
    };

    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        // 1. Initial Session Check (Supabase)
        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user?.email) {
                await handleUserHydration(session.user.email);
            } else {
                setIsLoading(false);
            }
        };

        // 2. Auth State Listener (Supabase)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[Supabase Auth] Event: ${event}`);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user?.email) {
                    await handleUserHydration(session.user.email);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                localStorage.removeItem('c2c_user');
                if (profileUnsubscribe) profileUnsubscribe();
            }
            setIsLoading(false);
        });

        const handleUserHydration = async (email: string) => {
            try {
                const freshProfile = await lookupUserProfileByEmail(email);
                if (freshProfile) {
                    setUser(freshProfile);
                    localStorage.setItem('c2c_user', JSON.stringify(freshProfile));

                    // Setup Real-time Profile Listener (Supabase Realtime)
                    if (profileUnsubscribe) profileUnsubscribe();
                    
                    const isStudent = !isAdminUser(freshProfile);
                    const docId = isStudent ? (freshProfile as StudentUser).sapId : email;
                    const collection = isStudent ? 'students' : 'admins';

                    if (docId) {
                        profileUnsubscribe = userDb.onProfileChange?.(collection, docId, (updatedProfile) => {
                            console.log('[Supabase Realtime] Profile Updated');
                            setUser(prev => ({ ...prev, ...updatedProfile }));
                            localStorage.setItem('c2c_user', JSON.stringify({ ...freshProfile, ...updatedProfile }));
                        });
                    }
                } else {
                    await supabase.auth.signOut();
                    setUser(null);
                    localStorage.removeItem('c2c_user');
                }
            } catch (error) {
                console.error('Error hydrating user session:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        return () => {
            subscription.unsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    // Student Login via SAP ID (Supabase Auth)
    const login = async (sapId: string, password: string) => {
        setIsLoading(true);
        try {
            // In our system, student email is sapId@nmims.edu.in
            const email = `${sapId}@nmims.edu.in`;
            
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            
            // Re-fetch profile immediately for responsiveness
            const userData = await userDb.getStudentDoc(sapId);
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
            
            // 2. Create Profile in 'students' table
            const defaultUser: StudentUser = {
                uid: authData.user.id,
                sapId: data.sapId,
                name: data.fullName,
                email: data.email,
                phone: data.phone,
                role: 'student',
                branch: data.program,
                rollNo: '',
                currentYear: 1,
                onboardingStep: 0,
                program: data.program,
                cgpa: '',
                careerDiscoveryCompleted: false,
                profileCompleted: false,
                assessmentCompleted: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await userDb.updateUser('students', data.sapId, defaultUser);
            
            setUser(defaultUser);
            localStorage.setItem('c2c_user', JSON.stringify(defaultUser));
        } catch (error: any) {
            handleAuthError(error, 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
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
            setUser(newUser);
            localStorage.setItem('c2c_user', JSON.stringify(newUser));

            const isStudent = !isAdminUser(newUser);
            const collectionName = isStudent ? 'students' : 'admins';
            const docId = isStudent ? (newUser as StudentUser).sapId : newUser.email;

            await userDb.updateUser(collectionName, docId, {
                ...newUser,
                updatedAt: new Date().toISOString()
            });

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
        if (error.message?.includes('Invalid login credentials') || error.status === 400) {
            throw new Error('Incorrect credentials. Please check your SAP ID/Email and password.');
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
