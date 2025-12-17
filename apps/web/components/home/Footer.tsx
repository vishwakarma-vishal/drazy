import { footerLinks } from "@/data/common";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border bg-bg-app py-16">
            <div className="mx-auto max-w-[1024px] px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-12 md:grid-cols-4">

                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-text-main">
                            <div className="size-6 text-primary">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        clipRule="evenodd"
                                        d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <span className="text-lg font-black font-mono tracking-tight uppercase">Drazy</span>
                        </div>
                        <p className="text-sm text-text-subtle leading-relaxed">
                            Built by an engineer, for engineers.<br />
                            © {currentYear} Drazy
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category} className="flex flex-col gap-4">
                            <h4 className="text-sm font-bold text-text-main uppercase tracking-wider">
                                {category}
                            </h4>
                            {links.map((link) => (
                                <div
                                    key={link.label}
                                    className="flex items-center gap-2 w-fit"
                                >
                                    {link.status === 'live' ? (
                                        <a
                                            href={link.url}
                                            className="text-sm text-text-subtle hover:text-primary transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ) : (
                                        <span className="text-sm text-text-subtle cursor-not-allowed">
                                            {link.label}
                                        </span>
                                    )}

                                    {link.status === 'soon' && (
                                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-border/40 text-text-subtle">
                                            Soon
                                        </span>
                                    )}
                                </div>
                            ))}

                        </div>
                    ))}

                </div>
            </div>
        </footer>
    );
};