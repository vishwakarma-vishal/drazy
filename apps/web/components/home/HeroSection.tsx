

export default function HeroSection() {
  return (
    <section id="hero" className="mx-auto max-w-[1024px] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="flex flex-col gap-16 lg:gap-20 text-center items-center">
        <div className="flex flex-col gap-8 max-w-[800px] items-center">

          <div className="inline-flex items-center gap-2 rounded border border-primary/20 bg-primary/5 px-3 py-1 w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono font-medium text-primary">BETA · ACTIVELY EVOLVING
            </span>
          </div>

          <h1 className="text-5xl font-black leading-[1.1] tracking-tight text-text-main sm:text-6xl lg:text-7xl">
            The Whiteboard for <br className="hidden sm:block" />
            <span className="text-primary decoration-4 underline-offset-4">Modern Engineering</span>
          </h1>

          <h2 className="text-lg font-medium leading-relaxed text-text-subtle sm:text-xl max-w-2xl mx-auto">
            A high-performance, distraction-free canvas for flow diagrams,
            technical brainstorming, and visual problem solving.
            No fluff, just logic.
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded 
                           bg-primary px-6 text-base font-bold transition-all duration-300
                           
                           // Light Mode Classes
                           text-primaryContrast hover:bg-teal-700 shadow-lg shadow-teal-900/10 hover:translate-y-[-2px]
                           
                           // Dark Mode Overrides
                           dark:text-primaryContrast dark:hover:bg-primary/90 dark:shadow-[0_0_15px_rgba(19,236,236,0.15)]"
          >
            <span>Start Whiteboarding</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
          <button
            className="flex h-12 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded 
                           border px-6 text-base font-bold transition-colors shadow-sm
                           
                           // Light Mode Classes (Default)
                           border-border bg-white text-gray-700 hover:border-primary/50 hover:text-primary hover:bg-gray-50
                           
                           // Dark Mode Overrides (Using unified variables)
                           dark:border-border dark:bg-transparent dark:text-text-main dark:hover:bg-bg-surface"
          >
            <span className="material-symbols-outlined text-lg">map</span>
            <span>View Roadmap</span>
          </button>
        </div>

        {/* Screen Mockup Container */}
        <div className="w-full relative mt-12 lg:mt-16 group perspective-1000">

          <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-lg blur-md opacity-0 dark:opacity-30 group-hover:opacity-50 transition duration-1000">
          </div>

          {/* Main Screen Content */}
          <div
            className="relative w-full aspect-[16/9] rounded-lg border border-border bg-bg-surface shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-500 hover:scale-[1.01]"
          >
            {/* Toolbar */}
            <div
              className="h-12 border-b border-border flex items-center justify-between px-4 gap-4 bg-gray-50 dark:bg-bg-app z-10 relative"
            >
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-red-500/20 dark:border dark:border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-yellow-500/20 dark:border dark:border-yellow-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-green-500/20 dark:border dark:border-green-500/40"></div>
              </div>

              {/* URL Bar */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div
                  className="h-8 w-64 rounded border border-border bg-white dark:bg-bg-surface flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-xs text-primary">lock</span>
                  <span
                    className="text-[10px] font-mono text-gray-400"
                  >
                    drazy.io/board/x9f2-sys-arch
                  </span>
                </div>
              </div>

              {/* Avatars and Share Button */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border border-white dark:border-bg-app bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">JD</div>
                  <div className="w-6 h-6 rounded-full border border-white dark:border-bg-app bg-teal-500 dark:bg-green-500 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">AK</div>
                  <div className="w-6 h-6 rounded-full border border-white dark:border-bg-app bg-indigo-500 dark:bg-purple-500 flex items-center justify-center text-[8px] text-white font-bold shadow-sm">MS</div>
                </div>
                <button
                  className="bg-primary hover:bg-teal-700 dark:hover:bg-primary/90 transition-colors text-primaryContrast text-[10px] font-bold px-3 py-1.5 rounded"
                >
                  Share
                </button>
              </div>
            </div>

            {/* Drawing Canvas Area */}
            <div
              className="flex-1 relative bg-white dark:bg-bg-app [background-size:20px_20px] 
                                   bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] 
                                   dark:bg-[radial-gradient(#30363d_1px,transparent_1px)]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-90 mix-blend-multiply dark:mix-blend-normal"
                data-alt="Dynamic, wireframe-style representation of a collaborative session with multiple cursors, suggesting real-time interaction and creative flow"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDqtnslf9YjAWOz5hqFAfO-iXFqaxvH8aAV-Lmz7u4oaIxoeiT15UwDmHQ4tqS_F_A8rR7KXNKDYq6AYFopEEgQhJHrxS30q0CGJsFRQ5_9JeYe5gq4ZmL3wM3PPoTsNGT6TuZdW9wCHD-Sd-P0bgdeMAbfk7y1i-wWq7AhN9n1y_idYl3w2QL-0xN3ZkvsvAAuUXPbss2Kx9EW5_0Ck2kSVTbuSRUeld4nU_G0B8L0fXg8QyszcGjOsef_exwTgsJFB4feI-st4aC8")' }}
              ></div>

              {/* Toolbar (left side) */}
              <div
                className="absolute top-6 left-6 flex flex-col gap-3 p-2 rounded-lg border border-border bg-white dark:bg-bg-surface shadow-lg dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                {/* Selected Tool */}
                <div className="w-10 h-10 flex items-center justify-center rounded bg-primary/10 text-primary cursor-pointer border border-primary/20 shadow-sm">
                  <span className="material-symbols-outlined text-[22px]">ads_click</span>
                </div>
                {/* Inactive Tools (Hover colors change) */}
                <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">rectangle</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">diamond</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">text_fields</span>
                </div>
                <div className="w-10 h-10 flex items-center justify-center rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer text-gray-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[22px]">link</span>
                </div>
              </div>

              {/* Collaborator Cursor 1 */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none">
                <div className="absolute -top-4 -left-4 flex flex-col gap-1 dark:animate-pulse">
                  <svg className="w-4 h-4 text-primary fill-primary drop-shadow-md" viewBox="0 0 24 24">
                    <path d="M0 0L8.5 22.5L11.5 13L21.5 10L0 0Z"></path>
                  </svg>
                  <span
                    className="bg-primary text-primaryContrast text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">
                    Sarah (Editing)
                  </span>
                </div>
              </div>

              {/* Collaborator Cursor 2 */}
              <div className="absolute bottom-1/3 right-1/4 pointer-events-none">
                <div className="absolute flex flex-col gap-1">
                  <svg className="w-4 h-4 text-indigo-500 dark:text-purple-500 fill-indigo-500 dark:fill-purple-500 drop-shadow-md" viewBox="0 0 24 24">
                    <path d="M0 0L8.5 22.5L11.5 13L21.5 10L0 0Z"></path>
                  </svg>
                  <span
                    className="bg-indigo-500 dark:bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">
                    David
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}