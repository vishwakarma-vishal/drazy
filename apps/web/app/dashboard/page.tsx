"use client";

import { useAuth } from "@/auth/AuthContext";
import http from "@/lib/http";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { devLogger } from "../utils/logger";

export default function Dashboard() {
    const { status, logout } = useAuth();
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [rooms, setRooms] = useState<any[]>([]);
    const [showMenuFor, setShowMenuFor] = useState<string | null>(null);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [createRoomName, setCreateRoomName] = useState("");
    const [renameRoomName, setRenameRoomName] = useState("");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState<string | null>(null);

    const fetchUserRooms = async () => {
        try {
            const response = await http.get("/room");
            const data = response.data;
            const { success, rooms } = data;
            if (success) {
                setRooms(rooms);
            }
        } catch (error) {
            devLogger.error("dashboard", "fetchUserRooms", "error", error);
        }
    }

    useEffect(() => { fetchUserRooms(); }, []);

    const filteredRooms = useMemo(() => {
        return rooms.filter((room) =>
            room.slug.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [rooms, searchQuery]);

    useEffect(() => {
        if (status === "unauthenticated") router.replace("/auth");
    }, [status, router]);

    if (status === "loading" || status === "unauthenticated") return null;

    const addNewRoom = async () => {
        if (!createRoomName.trim()) return;
        try {
            const response = await http.post("/room", { slug: createRoomName });
            if (response.data.success) {
                setRooms(prev => [...prev, { slug: response.data.slug, id: response.data.roomId }]);
                setCreateRoomName("");
            }
        } finally { setIsCreateOpen(false); }
    }

    const updateRoomName = async (e: FormEvent) => {
        if (!renameRoomName.trim() || !activeRoomId) return;
        try {
            const response = await http.put(`/room/${activeRoomId}`, { newSlug: renameRoomName });
            if (response.data.success) {
                setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, slug: renameRoomName } : r));
            }
        } finally {
            setIsRenameOpen(false);
            setActiveRoomId(null);
        }
    }

    const deleteRoom = async () => {
        if (!roomToDelete) return;
        try {
            const response = await http.delete(`/room/${roomToDelete}`);
            if (response.data.success) {
                setRooms(prev => prev.filter(r => r.id !== roomToDelete));
            }
        } finally {
            setIsDeleteOpen(false);
            setRoomToDelete(null);
        }
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-bg-app font-body text-text-main transition-colors duration-200">
            <main className="flex flex-1 flex-col min-w-0">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-bg-surface px-6">
                    <div className="flex w-full items-center justify-between gap-4 md:gap-8">
                        <Link href="/" className="group flex items-center gap-2 shrink-0">
                            <div className="size-7 text-primary transition-transform duration-500 group-hover:rotate-90">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                                </svg>
                            </div>
                            <h2 className="hidden font-display text-lg font-bold tracking-tight sm:block">DRAZY</h2>
                        </Link>

                        {/* Search visible on mobile */}
                        <div className="relative flex-1 max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-lg border border-border bg-bg-app pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <button onClick={() => logout()} className="shrink-0 flex h-9 items-center justify-center rounded border border-primary bg-primary px-3 md:px-4 text-xs md:text-sm font-bold text-primaryContrast hover:bg-teal-700 dark:bg-primary/10 dark:text-primary transition-all shadow-sm">
                            <span className="font-mono">LOGOUT</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
                    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="font-display text-2xl font-bold tracking-tight">My Canvas</h2>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewMode('grid')} className={`flex size-8 items-center justify-center rounded-lg border border-border transition-colors ${viewMode === 'grid' ? 'bg-bg-app text-primary' : 'bg-bg-surface text-text-subtle'}`}>
                                    <span className="material-symbols-outlined text-[18px]">view_module</span>
                                </button>
                                <button onClick={() => setViewMode('list')} className={`flex size-8 items-center justify-center rounded-lg border border-border transition-colors ${viewMode === 'list' ? 'bg-bg-app text-primary' : 'bg-bg-surface text-text-subtle'}`}>
                                    <span className="material-symbols-outlined text-[18px]">view_list</span>
                                </button>
                            </div>
                        </div>

                        {/* No results notice */}
                        {searchQuery && filteredRooms.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-text-subtle mb-2">search_off</span>
                                <p className="text-text-subtle">No canvases found for "{searchQuery}"</p>
                            </div>
                        )}

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                <button onClick={() => setIsCreateOpen(true)} className="group flex h-64 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-6 text-center transition-all hover:border-primary hover:bg-primary/5">
                                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                                        <span className="material-symbols-outlined text-primary" style={{ fontSize: '32px' }}>add</span>
                                    </div>
                                    <h3 className="font-semibold">Create New</h3>
                                </button>

                                {filteredRooms.map((room) => (
                                    <div key={room.id} className="group relative flex h-64 flex-col overflow-hidden rounded-2xl border border-border bg-bg-surface transition-all duration-300 hover:border-primary/40 hover:shadow-dynamic-primary">
                                        {/* Canvas Link */}
                                        <Link href={`/room/${room.id}/${room.slug}`} className="relative flex flex-1 items-center justify-center bg-bg-app overflow-hidden cursor-pointer">
                                            <div className="grid-bg-pattern absolute inset-0 opacity-10" />
                                            <div className="size-20 rounded-xl border border-border bg-bg-surface shadow-sm rotate-3 group-hover:rotate-0 group-hover:scale-110 transition-transform duration-500" />
                                        </Link>

                                        <div className="flex h-20 items-center justify-between p-4 border-t border-border bg-bg-surface">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-bold tracking-tight text-text-main group-hover:text-primary transition-colors">{room.slug}</h3>
                                                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-text-subtle">{room.owner === 'me' ? 'Personal' : 'Shared'}</p>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); setShowMenuFor(showMenuFor === room.id ? null : room.id); }} className={`flex size-8 items-center justify-center rounded-lg transition-all ${showMenuFor === room.id ? 'bg-primary text-primaryContrast' : 'hover:bg-bg-app text-text-subtle hover:text-text-main'}`}>
                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                            </button>
                                        </div>

                                        {showMenuFor === room.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowMenuFor(null)} />
                                                <div className="absolute right-3 bottom-16 z-50 w-40 rounded-xl border border-border bg-bg-surface p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                                    <button onClick={() => { setActiveRoomId(room.id); setRenameRoomName(room.slug); setIsRenameOpen(true); setShowMenuFor(null); }} className="flex w-full items-center gap-2 rounded-lg p-1 text-left text-xs font-semibold hover:bg-bg-app transition-colors">
                                                        <span className="material-symbols-outlined text-sm">edit</span> Rename
                                                    </button>
                                                    <div className="my-1 h-px bg-border" />
                                                    <button onClick={() => { setRoomToDelete(room.id); setIsDeleteOpen(true); setShowMenuFor(null); }} className="flex w-full items-center gap-2 rounded-lg p-1 text-left text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col rounded-2xl border border-border bg-bg-surface shadow-sm overflow-visible pb-24">
                                <button onClick={() => setIsCreateOpen(true)} className="group flex flex-col items-center justify-center gap-4 border-b border-dashed border-border p-6 hover:bg-primary/5 transition-all">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-primary">add</span>
                                    </div>
                                    <h3 className="text-sm font-semibold">Create New Canvas</h3>
                                </button>

                                {filteredRooms.map((room) => (
                                    <div key={room.id} className="group relative flex items-center justify-between border-b border-border p-4 transition-all last:border-none hover:bg-bg-app/50">
                                        <Link href={`/room/${room.id}/${room.slug}`} className="flex items-center gap-4 min-w-0 flex-1 cursor-pointer">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-app text-primary transition-transform group-hover:scale-105">
                                                <span className="material-symbols-outlined text-[22px]">description</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-bold text-text-main group-hover:text-primary transition-colors">{room.slug}</h3>
                                                <p className="flex items-center gap-1.5 text-xs text-text-subtle">
                                                    <span className="font-medium text-primary/80">{room.owner === 'me' ? 'Owned by you' : 'Shared'}</span>
                                                    <span className="size-1 rounded-full bg-border" />
                                                    <span>Last edited 2h ago</span>
                                                </p>
                                            </div>
                                        </Link>

                                        <div className="relative">
                                            <button onClick={(e) => { e.stopPropagation(); setShowMenuFor(showMenuFor === room.id ? null : room.id); }} className={`flex size-9 items-center justify-center rounded-lg transition-all ${showMenuFor === room.id ? 'bg-primary text-primaryContrast' : 'text-text-subtle hover:bg-border/50'}`}>
                                                <span className="material-symbols-outlined">more_horiz</span>
                                            </button>
                                            {showMenuFor === room.id && (
                                                <>
                                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenuFor(null)} />
                                                    {/* Fix: Changed top-full to bottom-full for consistency in scrollable areas */}
                                                    <div className="absolute right-0 bottom-full mb-1 z-50 w-40 rounded-xl border border-border bg-bg-surface p-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-1 duration-150">
                                                        <button onClick={() => { setActiveRoomId(room.id); setRenameRoomName(room.slug); setIsRenameOpen(true); setShowMenuFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold hover:bg-bg-app transition-colors">
                                                            <span className="material-symbols-outlined text-sm">edit</span> Rename
                                                        </button>
                                                        <button onClick={() => { setRoomToDelete(room.id); setIsDeleteOpen(true); setShowMenuFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
                                                            <span className="material-symbols-outlined text-sm">delete</span> Delete
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modals remain the same... */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface p-6 shadow-dynamic-primary animate-in fade-in zoom-in duration-200">
                        <h3 className="font-display text-xl font-bold tracking-tight text-text-main">Create New Canvas</h3>
                        <p className="mt-1 text-sm text-text-subtle">Give your masterpiece a name to get started.</p>
                        <div className="mt-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-subtle ml-1">Canvas Name</label>
                            <input autoFocus value={createRoomName} onChange={(e) => setCreateRoomName(e.target.value)} placeholder="e.g. Architecture Diagram" className="mt-1.5 h-11 w-full rounded-lg border border-border bg-bg-app px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button onClick={() => setIsCreateOpen(false)} className="h-10 px-4 text-sm font-semibold text-text-subtle">Cancel</button>
                            <button onClick={addNewRoom} className="flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primaryContrast shadow-sm hover:brightness-110 active:scale-95 transition-all">Create Canvas</button>
                        </div>
                    </div>
                </div>
            )}

            {isRenameOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsRenameOpen(false)} />
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-bg-surface p-6 shadow-dynamic-primary animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><span className="material-symbols-outlined text-[20px]">edit_note</span></div>
                            <h3 className="font-display text-xl font-bold tracking-tight text-text-main">Rename Canvas</h3>
                        </div>
                        <div className="mt-6">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-subtle ml-1">New Title</label>
                            <input autoFocus value={renameRoomName} onChange={(e) => setRenameRoomName(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-border bg-bg-app px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-3">
                            <button onClick={() => setIsRenameOpen(false)} className="h-10 px-4 text-sm font-semibold text-text-subtle">Cancel</button>
                            <button onClick={updateRoomName} className="flex h-10 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primaryContrast shadow-sm hover:brightness-110 transition-all">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {isDeleteOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
                    <div className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-surface p-6 shadow-2xl">
                        <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 mb-4"><span className="material-symbols-outlined">delete_forever</span></div>
                        <h3 className="text-lg font-bold">Delete Canvas?</h3>
                        <p className="mt-2 text-sm text-text-subtle">This action is permanent and cannot be undone.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setIsDeleteOpen(false)} className="px-4 text-sm font-semibold text-text-subtle">Cancel</button>
                            <button onClick={deleteRoom} className="h-10 rounded-lg bg-red-500 px-6 text-sm font-bold text-white hover:bg-red-600">Confirm Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}