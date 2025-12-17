import { roadmap } from "@/data/common";

export default function RoadmapSection() {
    return (
        <section className="mx-auto max-w-[1024px] px-4 py-32 sm:px-6 lg:px-8" id="roadmap">
            <div className="flex flex-col gap-12">
                <div className="flex flex-col gap-4 max-w-2xl">
                    <h2 className="text-3xl font-bold leading-tight tracking-tight text-text-main sm:text-4xl">
                        Roadmap
                    </h2>
                    <p className="text-xl text-text-subtle">
                        We are building in public. Here is what is coming next.
                    </p>
                </div>

                {/* Timeline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                    <div className="hidden md:block absolute top-[2.5rem] left-0 w-full h-0.5 bg-border -z-10" />

                    {roadmap.map((item) => (
                        <div key={item.title} className="relative flex flex-col gap-6 bg-bg-app pt-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className={`h-6 w-6 rounded-full border-4 border-bg-app z-10 box-content ${item.status === 'completed'
                                        ? 'bg-primary shadow-[0_0_0_1px_var(--primary)]'
                                        : 'bg-border'
                                        }`}
                                />
                                <span
                                    className={`text-sm font-mono font-bold uppercase tracking-wide px-2 py-0.5 rounded ${item.status === 'completed'
                                        ? 'text-primary bg-primary/10'
                                        : 'text-text-subtle bg-border/20'
                                        }`}
                                >
                                    {item.quarter}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-text-main">{item.title}</h3>
                            <p className="text-base text-text-subtle leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};