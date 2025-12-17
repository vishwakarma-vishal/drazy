
export default function CTASection() {
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
                <div className="flex flex-col sm:flex-row gap-6 w-full justify-center">
                    <button className="
            flex h-14 items-center justify-center rounded bg-primary px-10 
            text-bg-app text-lg font-bold transition-all 
            shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]
            hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] 
            hover:translate-y-[-2px]
          ">
                        Get Started for Free
                    </button>

                    <button className="
            flex h-14 items-center justify-center rounded border border-border 
            bg-transparent px-10 text-text-main text-lg font-bold transition-all 
            hover:bg-surface-main hover:text-primary hover:border-primary/50 
            shadow-sm
          ">
                        View Roadmap
                    </button>
                </div>

                <p className="text-sm text-text-subtle mt-2 font-mono">
                    Free to start. No credit card required.
                </p>
            </div>
        </section>
    );
};