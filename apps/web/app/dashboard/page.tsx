"use client";

import useSocket from "@/app/hooks/useSocket";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Dashboard() {
    const { status } = useSocket();

    if (status === "CONNECTING") {
        return <div>Loading...</div>
    }

    if (status === "UNAUTHORIZED") {
        return <div>Invalid or expired token. Sign in again.</div>
    }

    if (status === "OPEN") {
        return (
            <DrazyDashboard />
        );
    }

    return <div>Connection closed. Please refresh the page.</div>;
}

const CANVASES = [
    { id: 1, title: "Q3 Architecture Diagram", meta: "Edited 2h ago", owner: "me" },
    { id: 2, title: "User Flow - Registration", meta: "Edited yesterday", owner: "others" },
    { id: 3, title: "Brainstorming Session", meta: "Edited 3 days ago", owner: "me" },
    { id: 4, title: "Database Schema v2", meta: "Edited 1 week ago", owner: "others" },
    { id: 5, title: "Product Roadmap 2024", meta: "Edited 2 weeks ago", owner: "me" },
];

export function DrazyDashboard() {
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [ownerFilter, setOwnerFilter] = useState("all");
    const [viewMode, setViewMode] = useState("grid");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const filteredCanvases = useMemo(() => {
        return CANVASES.filter(canvas => {
            const matchesSearch = canvas.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesOwner = ownerFilter === "all" || canvas.owner === ownerFilter;
            return matchesSearch && matchesOwner;
        });
    }, [searchQuery, ownerFilter]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg-app font-body text-text-main transition-colors duration-200">
            <main className="flex flex-1 flex-col min-w-0">

                <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg-surface px-6">
                    <div className="flex w-full  items-center justify-between gap-8">
                        <Link
                            href="/"
                            className="group flex items-center gap-2">
                            <div className="size-7 text-primary transition-transform duration-500 group-hover:rotate-90">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="font-display text-lg font-bold tracking-tight">DRAZY</h2>
                        </Link>

                        <div className="relative hidden flex-1 max-w-md sm:block">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle">search</span>
                            <input
                                type="text"
                                placeholder="Search canvases..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border bg-bg-app pl-10 pr-4 text-sm transition-all placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>

                        <button
                            onClick={() => router.push("/auth")}
                            className="flex h-9 items-center justify-center rounded border border-primary 
                                   text-sm font-bold transition-all duration-200 shadow-sm
                                   
                                   // Light Mode Classes (Default)
                                   bg-primary px-4 text-primaryContrast hover:bg-teal-700 
                                   
                                   // Dark Mode 
                                   dark:bg-primary/10 dark:text-primary dark:hover:bg-primary dark:hover:text-bg-app"
                        >
                            <span className="font-mono">Log Out</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
                    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">

                        {/* Toolbar */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-display text-2xl font-bold tracking-tight">Recent Canvases</h2>

                            <div className="flex items-center gap-2">
                                {/* Owner Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-border bg-bg-surface px-3 py-1.5 text-xs font-medium hover:border-text-subtle transition-colors"
                                    >
                                        <span>Owner: {ownerFilter === 'all' ? 'All' : ownerFilter === 'me' ? 'Owned by me' : 'Others'}</span>
                                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                    </button>

                                    {isDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-40 z-50 rounded-lg border border-border bg-bg-surface py-1 shadow-lg">
                                            <button onClick={() => { setOwnerFilter('all'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-xs hover:bg-bg-app">All</button>
                                            <button onClick={() => { setOwnerFilter('me'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-xs hover:bg-bg-app">Owned by me</button>
                                            <button onClick={() => { setOwnerFilter('others'); setIsDropdownOpen(false); }} className="w-full px-4 py-2 text-left text-xs hover:bg-bg-app">Others</button>
                                        </div>
                                    )}
                                </div>

                                <div className="mx-1 h-4 w-px bg-border" />

                                {/* View Toggles */}
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`flex size-8 items-center justify-center rounded-lg border border-border transition-colors ${viewMode === 'grid' ? 'bg-bg-app text-primary' : 'bg-bg-surface text-text-subtle'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">view_module</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex size-8 items-center justify-center rounded-lg border border-border transition-colors ${viewMode === 'list' ? 'bg-bg-app text-primary' : 'bg-bg-surface text-text-subtle'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">view_list</span>
                                </button>
                            </div>
                        </div>

                        {/* Content Display */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                <button className="group flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-6 text-center transition-all duration-200 hover:border-primary hover:bg-primary/5 focus:ring-2 focus:ring-primary">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>add</span>
                                    </div>
                                    <h3 className="font-semibold">Create New</h3>
                                </button>

                                {filteredCanvases.map((canvas) => (
                                    <div key={canvas.id} className="group flex h-64 flex-col overflow-hidden rounded-xl border border-border bg-bg-surface transition-all duration-200 hover:border-primary/50 hover:shadow-dynamic-primary">
                                        <div className="relative flex flex-1 items-center justify-center bg-bg-app">
                                            <div className="grid-bg-pattern absolute inset-0 opacity-10" />
                                            <div className="size-16 rounded-lg border border-border bg-bg-surface" />
                                        </div>
                                        <div className="flex h-20 items-center justify-between p-4">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold">{canvas.title}</h3>
                                                <p className="text-xs text-text-subtle">{canvas.meta}</p>
                                            </div>
                                            <span className="material-symbols-outlined text-text-subtle cursor-pointer">more_vert</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* List View */
                            <div className="flex flex-col border border-border rounded-xl bg-bg-surface overflow-hidden">
                                {filteredCanvases.map((canvas) => (
                                    <div key={canvas.id} className="flex items-center justify-between p-4 border-b border-border last:border-none hover:bg-bg-app transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-primary">description</span>
                                            <div>
                                                <h3 className="text-sm font-semibold">{canvas.title}</h3>
                                                <p className="text-xs text-text-subtle">{canvas.meta} • {canvas.owner === 'me' ? 'Owned by me' : 'Others'}</p>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-text-subtle">more_vert</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}