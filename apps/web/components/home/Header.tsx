
export default function Header() {
    return (
        <header
            className="sticky top-0 z-50 w-full border-b border-border bg-bg-app/90 dark:bg-bg-app/95 backdrop-blur-md"
        >
            <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <a className="flex items-center gap-3 text-text-main group cursor-pointer" href="#">
                        <div className="size-7 text-primary transition-transform group-hover:rotate-90 duration-500">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd"
                                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                                    fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-black tracking-tight font-mono">DRAZY</h2>
                    </a>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-8">
                        <a className="text-sm font-medium text-text-subtle hover:text-primary transition-colors"
                            href="#features">Features</a>
                        <a className="text-sm font-medium text-text-subtle hover:text-primary transition-colors"
                            href="#roadmap">Roadmap</a>
                    </nav>
                    <div className="h-4 w-px bg-border hidden md:block"></div>
                    <div className="flex items-center gap-4">
                        <a className="hidden sm:block text-sm font-bold text-text-main hover:text-primary transition-colors"
                            href="#">Log In</a>

                        <button
                            className="flex h-9 items-center justify-center rounded border border-primary 
                                   text-sm font-bold transition-all duration-200 shadow-sm
                                   
                                   // Light Mode Classes (Default)
                                   bg-primary px-4 text-primaryContrast hover:bg-teal-700 
                                   
                                   // Dark Mode 
                                   dark:bg-primary/10 dark:text-primary dark:hover:bg-primary dark:hover:text-bg-app"
                        >
                            <span className="font-mono">Get Started</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}