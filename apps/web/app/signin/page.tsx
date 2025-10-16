"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { devLogger } from "../utils/logger";

export default function SignIn() {
    const passRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    const signInHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const responseData = await axios.post(`${process.env.HTTP_BACKEND_URL}/auth/signin`, {
                password: passRef.current?.value,
                email: emailRef.current?.value
            });

            devLogger.info("signin", "SignIn", "Received responseData", responseData);

            const data = responseData.data;
            const success = data.success;

            if (success) {
                const token = data.token;
                localStorage.setItem("token", token);
                router.push("/dashboard");

                devLogger.info("signin", "SignIn", "Sign in successful, with token", token);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                const errorResponseData = error.response?.data;
                alert(errorResponseData.message);

                devLogger.error("signin", "SignIn", errorResponseData.message, error);
            }

            devLogger.error("signin", "SignIn", "Something went wrong", error);
        }
    }

    return (
        <div>
            <div>
                <div>
                    <h1>Sign In</h1>
                    <p>Login to your accoung</p>
                </div>

                <form onSubmit={signInHandler}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input ref={emailRef} type="email" placeholder="abc@gmail.com" id="email" name="email" required></input>
                    </div>
                    <div>
                        <label htmlFor="pass">Password</label>
                        <input ref={passRef} type="password" placeholder="******" id="pass" name="pass" required></input>
                    </div>

                    <button type="submit">Sign In</button>
                </form>
            </div>
        </div>
    )
}