import { capabilities } from '@/data/common';

export default function CoreCapabilitiesSection() {
    return (
        <section id="capabilities" className="mx-auto max-w-[1024px] px-4 py-32 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-16">
                <div className="max-w-3xl">
                    <h2 className="text-4xl font-bold leading-tight tracking-tight text-text-main mb-6">
                        Core capabilities.
                    </h2>
                    <p className="text-xl text-text-subtle">
                        Built on technical primitives that matter to engineers.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {capabilities.map((capability) => (
                        <div
                            key={capability.title}
                            className="group relative overflow-hidden rounded-xl border border-border bg-bg-surface p-10 transition-all hover:border-primary/50 hover:shadow-dynamic-primary"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span
                                    className="relative material-symbols-outlined text-primary rotate-12 transform"
                                    style={{ fontSize: '120px' }}
                                >
                                    {capability.icon === 'splitscreen' ? 'group_work' : capability.icon}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <div
                                    className="mb-8 flex h-14 w-14 items-center justify-center rounded-lg bg-bg-app border border-border text-primary shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-[28px]">{capability.icon}</span>
                                </div>

                                <h3 className="text-2xl font-bold text-text-main mb-4">{capability.title}</h3>
                                <p className="text-base leading-relaxed text-text-subtle">
                                    {capability.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};