"use client";

import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { devLogger } from '../utils/logger';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/auth/AuthContext';
import { toast } from '../utils/toast';

export default function Auth() {
    const { status, login } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
    const [showPassword, setShowPassword] = useState(false);
    const emailRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/dashboard");
        }
    }, [status, router]);

    if (status === "loading") return null;
    if (status === "authenticated") return null;

    const validateFields = () => {
        const email = emailRef.current?.value.trim() || "";
        const password = passwordRef.current?.value || "";

        if (!email || !password) {
            setError("Please fill in all fields.");
            return null;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return null;
        }

        if (activeTab === 'signup' && password.length < 6) {
            setError("Password must be at least 6 characters.");
            return null;
        }

        setError(null);
        return { email, password };
    };

    const handleFeatureNotReady = (e: React.MouseEvent, feature: string) => {
        e.preventDefault();
        toast.info(`${feature} will be available in the next update!`);
    };

    const signupHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        const credentials = validateFields();
        if (!credentials) return;

        setIsLoading(true);

        try {
            const responseData = await axios.post(`${process.env.HTTP_BACKEND_URL}/auth/signup`, {
                name: "dummyUser",
                email: credentials.email,
                password: credentials.password
            });

            devLogger.info("auth", "SignUp", "Received responseData", responseData);

            const data = responseData.data;
            const success = data.success;

            if (success) {
                const token = data.token;
                login(token);
                toast.success("Account created!");
                router.replace("/dashboard");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.status == 400) {
                    toast.warn(error.response?.data.message || "Signup failed");
                    return;
                }
            }
            toast.error("Something went wrong. Try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    const signinHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        const credentials = validateFields();
        if (!credentials) return;

        setIsLoading(true);

        try {
            const responseData = await axios.post(`${process.env.HTTP_BACKEND_URL}/auth/signin`, {
                email: credentials.email,
                password: credentials.password
            });

            devLogger.info("auth", "SignIn", "Received responseData", responseData);

            const data = responseData.data;
            const success = data.success;

            if (success) {
                const token = data.token;
                login(token);
                toast.success("Welcome back! Redirecting to dashboard...");
                router.replace("/dashboard");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const errorResponseData = error.response?.data;
                toast.warn(errorResponseData.message);

                devLogger.error("auth", "SignIn", errorResponseData.message, error);
                return;
            }
            toast.error("Something went wrong. Try again later.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center bg-bg-app font-body antialiased transition-colors duration-200  p-4 sm:p-8 z-10">

            <div className="w-full max-w-[440px] flex flex-col bg-bg-surface rounded-xl border border-border/20 shadow-sm overflow-hidden">

                <div className="px-8 pt-8 pb-2">
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-text-main font-display text-3xl font-black tracking-tight">
                            DRAZY
                        </h1>
                        <p className="text-text-subtle text-sm font-normal">
                            {activeTab === 'signin' ? 'Welcome back to the workspace.' : 'Create your workspace account.'}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-8 mt-6">
                    <div className="flex border-b border-border w-full">
                        <button
                            onClick={() => {
                                if (isLoading) return;
                                setError(null);
                                setActiveTab('signin')
                            }}
                            className={`flex flex-1 items-center justify-center border-b-2 pb-3 pt-2 transition-colors focus:outline-none ${activeTab === 'signin' ? 'border-primary' : 'border-transparent'
                                }`}
                        >
                            <span className={`text-sm transition-colors ${activeTab === 'signin' ? 'text-text-main font-semibold' : 'text-text-subtle font-medium hover:text-text-main'
                                }`}>Sign In</span>
                        </button>
                        <button
                            onClick={() => {
                                if (isLoading) return;
                                setError(null);
                                setActiveTab('signup')
                            }}
                            className={`flex flex-1 items-center justify-center border-b-2 pb-3 pt-2 transition-colors focus:outline-none ${activeTab === 'signup' ? 'border-primary' : 'border-transparent'
                                }`}
                        >
                            <span className={`text-sm transition-colors ${activeTab === 'signup' ? 'text-text-main font-semibold' : 'text-text-subtle font-medium hover:text-text-main'
                                }`}>Sign Up</span>
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <form
                    onSubmit={activeTab === 'signin' ? signinHandler : signupHandler}
                    className="p-8 flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-text-main text-sm font-medium" htmlFor="email">Email Address</label>
                        <input
                            ref={emailRef}
                            autoComplete="off"
                            onChange={() => setError(null)}
                            className="flex w-full rounded-lg border border-border dark:bg-bg-app text-text-main placeholder:text-text-subtle h-11 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm outline-none"
                            id="email" placeholder="user@company.com" type="email"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-text-main text-sm font-medium" htmlFor="password">Password</label>
                            <button
                                type="button"
                                onClick={(e) => handleFeatureNotReady(e, "Forgot Password")}
                                className="text-xs hover:opacity-80 font-medium text-primary cursor-help"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <div className="relative flex w-full items-center">
                            <input
                                ref={passwordRef}
                                autoComplete="new-password"
                                onChange={() => setError(null)}
                                className="flex w-full rounded-lg border border-border dark:bg-bg-app  text-text-main placeholder:text-text-subtle h-11 pl-4 pr-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm outline-none"
                                id="password" placeholder="Enter your password"
                                type={showPassword ? "text" : "password"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-main focus:outline-none"
                            >
                                <span className="material-symbols-outlined text-[20px] leading-none select-none">
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center -my-2 gap-2 text-red-500 animate-in fade-in slide-in-from-top-1">
                            <span className="material-symbols-outlined text-[16px]">error</span>
                            <span className="text-xs font-normal">{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        onClick={activeTab === 'signin' ? signinHandler : signupHandler}
                        className="mt-2 flex w-full items-center justify-center rounded-lg h-11 px-5 bg-primary text-sm text-bg-app font-bold tracking-wide transition-all 
               hover:opacity-90 active:scale-[0.98] 
               disabled:cursor-not-allowed disabled:opacity-70
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="size-4 animate-spin rounded-full border-2 border-bg-app/30 border-t-bg-app" />
                                <span>{activeTab === 'signin' ? 'Signing in...' : 'Signing up...'}</span>
                            </div>
                        ) : (
                            <span>{activeTab === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative bg-bg-surface px-3">
                            <span className="text-[12px] text-text-subtle font-bold uppercase">OR CONTINUE WITH</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="w-full">
                        <button
                            onClick={(e) => handleFeatureNotReady(e, "Google Login")}
                            className="flex items-center justify-center gap-2 rounded-lg border border-border dark:bg-bg-app h-10 px-4 w-full opacity-60 cursor-not-allowed">
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-medium text-text-main">Google</span>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="bg-bg-app border-t border-border p-4 text-center">
                    <p className="text-sm text-text-subtle">
                        {activeTab === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button
                            onClick={() => {
                                setError(null);
                                setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')
                            }}
                            className="font-medium text-primary hover:underline"
                        >
                            {activeTab === 'signin' ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div >
    );
}