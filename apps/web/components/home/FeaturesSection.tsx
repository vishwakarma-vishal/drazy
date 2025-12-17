import { features } from "@/data/common";


export default function FeaturesSection() {
    return (
        <section id="features" className="relative border-y border-border bg-bg-surface/50 overflow-hidden"
        >
            {/* Grid Background Pattern */}
            <div
                className="absolute inset-0 grid-bg-pattern [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
            ></div>

            {/* Content Wrapper */}
            <div className="relative mx-auto max-w-[1024px] px-4 py-32 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-20 items-start">

                    {/* Left Column: The Problem */}
                    <div className="flex-1 flex flex-col gap-8 pt-4">
                        <h3
                            className="text-primary font-mono text-sm tracking-wider uppercase font-bold flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            The Problem
                        </h3>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-text-main sm:text-4xl">
                            General-purpose tools fail at scale.
                        </h2>
                        <p className="text-lg text-text-subtle leading-relaxed">
                            Most whiteboarding tools are built for casual brainstorming. They choke on large
                            diagrams, lack precise controls for complex systems, and prioritize stickers over
                            structure. Developers need tools that respect technical constraints and performance.
                        </p>
                    </div>

                    {/* Right Column: The Solution (Features) */}
                    <div className="flex-1 flex flex-col gap-8">
                        <h3
                            className="text-primary font-mono text-sm tracking-wider uppercase font-bold flex items-center gap-2"
                        >
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            The Solution
                        </h3>
                        <h2 className="text-3xl font-bold leading-tight tracking-tight text-text-main sm:text-4xl">
                            Precision tooling for complex systems.
                        </h2>
                        <ul className="space-y-8 mt-4">
                            {features.map((feature) => (
                                <li key={feature.title} className="flex gap-5 group">
                                    <div
                                        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-primary/30 bg-primary/5 text-primary transition-colors group-hover:bg-primary/10 group-hover:border-primary/50"
                                    >
                                        <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-bold text-text-main mb-2">{feature.title}</h4>
                                        <p className="text-base text-text-subtle leading-relaxed">{feature.description}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};