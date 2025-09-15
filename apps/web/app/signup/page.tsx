"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function SignUp() {
    const nameRef = useRef<HTMLInputElement | null>(null);
    const passRef = useRef<HTMLInputElement | null>(null);
    const emailRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();

    const signUpHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const responseData = await axios.post(`${process.env.HTTP_BACKEND_URL}/auth/signup`, {
                name: nameRef.current?.value,
                password: passRef.current?.value,
                email: emailRef.current?.value
            });

            const data = responseData.data;
            const success = data.success;

            if (success) {
                const token = data.token;
                localStorage.setItem("token", token);
                router.push("/dashboard");
                alert("Signed up Successfully");
            }
        } catch (error) {
            if (error instanceof AxiosError && error.status == 400) {
                alert(error.response?.data.message);
            }
            console.log("Something went wrong, ", error);
        }
    }

    return (
        <div>
            <div>
                <div>
                    <h1>Sign Up</h1>
                    <p>Create an account</p>
                </div>

                <form onSubmit={signUpHandler}>
                    <div>
                        <label htmlFor="name">Name</label>
                        <input ref={nameRef} type="text" placeholder="enter your name..." id="name" name="name" required></input>
                    </div>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input ref={emailRef} type="email" placeholder="abc@gmail.com" id="email" name="email" required></input>
                    </div>
                    <div>
                        <label htmlFor="pass">Password</label>
                        <input ref={passRef} type="password" placeholder="******" id="pass" name="pass" required></input>
                    </div>

                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    )
}