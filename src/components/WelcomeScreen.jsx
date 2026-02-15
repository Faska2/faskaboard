import React, { useEffect, useState } from 'react';
import { Plus, Upload, Clock, Trash2, ExternalLink } from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { loadRecentBoards, deleteRecentBoard } from '../utils/localStorageManager';

const WelcomeScreen = ({ onStart }) => {
    const [recentBoards, setRecentBoards] = useState([]);
    const { resetBoard, setBoardState } = useBoardStore();

    useEffect(() => {
        setRecentBoards(loadRecentBoards());
    }, []);

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.objects) {
                        setBoardState(data);
                        onStart();
                    } else {
                        alert('Invalid project file format.');
                    }
                } catch (err) {
                    alert('Error reading file. Please upload a valid JSON project.');
                }
            };
            reader.readAsText(file);
        }
    };

    const handleLoadBoard = (board) => {
        setBoardState(board);
        onStart();
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        deleteRecentBoard(id);
        setRecentBoards(loadRecentBoards());
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-6 font-sans">
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

                {/* Left Side: Branding */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-neutral-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-neutral-900 shadow-2xl rotate-3">
                            <span className="font-bold text-3xl">F</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">FaskaBoard</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Professional Architectural Whiteboard</p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mt-8">Start your next masterpiece</h2>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => { resetBoard(); onStart(); }}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-neutral-900 dark:text-white">Create New Board</span>
                                <span className="text-xs text-neutral-400">Blank canvas for your ideas</span>
                            </div>
                        </button>

                        <label className="group flex items-center gap-4 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="text-purple-600" />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-neutral-900 dark:text-white">Import Project</span>
                                <span className="text-xs text-neutral-400">Upload .json board files</span>
                            </div>
                            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>

                        {/* Portfolio Link */}
                        <a
                            href="https://faskaeloua.netlify.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-4 bg-neutral-900 dark:bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/10 dark:bg-neutral-900/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <ExternalLink className="text-white dark:text-neutral-900" size={20} />
                            </div>
                            <div className="text-left">
                                <span className="block font-bold text-white dark:text-neutral-900">Discover More Projects</span>
                                <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">faskaeloua.netlify.app</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Right Side: Recent Boards */}
                <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-[32px] p-8 min-h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                            <Clock size={18} className="text-neutral-400" /> Recent Boards
                        </h3>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto pr-2 no-scrollbar">
                        {recentBoards.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-400 space-y-2 opacity-50">
                                <Plus size={48} strokeWidth={1} />
                                <p className="text-sm">No recent boards found</p>
                            </div>
                        ) : (
                            recentBoards.map((board) => (
                                <div
                                    key={board.id}
                                    onClick={() => handleLoadBoard(board)}
                                    className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl hover:border-neutral-400 dark:hover:border-neutral-600 cursor-pointer transition-all group"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-400">
                                            {board.objects.length}
                                        </div>
                                        <div>
                                            <span className="block font-semibold text-neutral-900 dark:text-white text-sm">Board {board.id.substring(0, 8)}</span>
                                            <span className="text-[10px] text-neutral-400">{new Date(board.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDelete(board.id, e)}
                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
