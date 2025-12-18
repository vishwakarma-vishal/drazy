"use client";
import { useAuth } from "@/auth/AuthContext";
import Link from "next/link";

export default function CTASection() {
    const { status } = useAuth();

    return (
        <section id="cta" className="border-t border-border bg-bg-surface py-32 text-center">
            <div className="mx-auto max-w-[1024px] px-4 flex flex-col items-center gap-10">
                <h2 className="text-4xl font-black tracking-tight text-text-main sm:text-5xl">
                    Ready to sync your canvas?
                </h2>

                <p className="max-w-[600px] text-xl text-text-subtle leading-relaxed">
                    Join developers collaborating remotely using DRAZY for focused, real-time visual work.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <Link
                        href={status === "authenticated" ? "/dashboard" : "/auth"}
                        className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded 
                           bg-primary px-6 text-base font-bold transition-all duration-300
                           
                           // Light Mode Classes
                           text-primaryContrast hover:bg-teal-700 shadow-lg shadow-teal-900/10 hover:translate-y-[-2px]
                           
                           // Dark Mode Overrides
                           dark:text-primaryContrast hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(19,236,236,0.15)]"
                    >
                        <span>Start Whiteboarding</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </Link>
                    <a
                        href="#roadmap"
                        className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded 
                           border px-6 text-base font-bold transition-colors shadow-sm
                           
                           // Light Mode Classes (Default)
                           border-border bg-white text-gray-700 hover:border-primary/50 hover:text-primary hover:bg-gray-50
                           
                           // Dark Mode Overrides (Using unified variables)
                           dark:border-border dark:bg-transparent dark:text-text-main dark:hover:bg-bg-surface"
                    >
                        <span className="material-symbols-outlined text-lg">map</span>
                        <span>View Roadmap</span>
                    </a>
                </div>

                <p className="text-sm text-text-subtle mt-2 font-mono">
                    Free to start. No credit card required.
                </p>
            </div>
        </section>
    );
};