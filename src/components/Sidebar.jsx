import React, { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    Trash2,
    Lock,
    Unlock,
    Layers,
    Settings,
    Download,
    Share2,
    Monitor,
    Moon,
    Sun,
    AlignCenterVertical,
    AlignCenterHorizontal,
    AlignStartHorizontal,
    AlignEndHorizontal,
    AlignStartVertical,
    AlignEndVertical
} from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';
import { exportToJSON, exportToImage, exportToSVG } from '../utils/exportUtils';

const Sidebar = ({ stageRef }) => {
    const [isOpen, setIsOpen] = useState(false); // Default closed on mobile, logic below
    const {
        objects,
        selectedIds,
        updateObject,
        deleteObjects,
        toggleLock,
        defaultStyles,
        updateDefaultStyles,
        canvasConfig,
        updateCanvas,
        alignObjects,
        setSelectedIds,
        bringToFront,
        sendToBack,
        saveHistory
    } = useBoardStore();

    const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
    const isMultiSelect = selectedIds.length > 1;
    const isSingleSelect = selectedIds.length === 1;
    const targetObj = isSingleSelect ? selectedObjects[0] : null;

    const handleStyleChange = (key, value) => {
        saveHistory();
        if (selectedIds.length > 0) {
            selectedIds.forEach(id => updateObject(id, { [key]: value }, false));
        } else {
            updateDefaultStyles({ [key]: value });
        }
    };

    const colors = [
        '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b',
        '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed top-6 right-6 z-50 panel p-3 md:hidden shadow-premium ${isOpen ? 'bg-neutral-900 text-white' : ''}`}
            >
                <Settings size={20} />
            </button>

            {/* Desktop Sidebar Hook */}
            <div className={`fixed right-6 top-6 bottom-6 transition-all duration-500 z-50 
        ${isOpen ? 'w-[calc(100vw-48px)] md:w-80 translate-x-0' : 'w-80 translate-x-[calc(100%+48px)] md:translate-x-0 md:w-80'} 
        ${!isOpen && 'md:w-0 md:translate-x-[calc(100%+48px)]'}`}>

                {/* Desktop Collapse Arrow */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute -left-12 top-0 panel p-2 hidden md:block hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-transform"
                >
                    {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className="h-full panel flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Settings size={18} className="text-neutral-400" />
                            Properties
                        </h3>
                        <div className="flex gap-1">
                            <button
                                onClick={() => updateCanvas({ darkMode: !canvasConfig.darkMode })}
                                className="icon-btn"
                            >
                                {canvasConfig.darkMode ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="md:hidden icon-btn">
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {/* Colors */}
                        <section className="space-y-3">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Stroke Color</label>
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleStyleChange('strokeColor', color)}
                                        className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 ${(targetObj?.strokeColor || defaultStyles.strokeColor) === color ? 'border-neutral-900 ring-2 ring-neutral-200 shadow-md' : 'border-neutral-100 dark:border-neutral-800'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Fill Color</label>
                            <div className="grid grid-cols-5 gap-2">
                                {colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleStyleChange('fillColor', color)}
                                        className={`w-full aspect-square rounded-full border-2 transition-transform hover:scale-110 ${(targetObj?.fillColor || defaultStyles.fillColor) === color ? 'border-neutral-900 ring-2 ring-neutral-200 shadow-md' : 'border-neutral-100 dark:border-neutral-800'
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Stroke Width */}
                        <section className="space-y-3">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Stroke Width</label>
                            <input
                                type="range" min="1" max="20"
                                value={targetObj?.strokeWidth || defaultStyles.strokeWidth}
                                onChange={(e) => handleStyleChange('strokeWidth', parseInt(e.target.value))}
                                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                            />
                        </section>

                        {/* Opacity */}
                        <section className="space-y-3">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Opacity</label>
                            <input
                                type="range" min="0" max="1" step="0.1"
                                value={targetObj?.opacity || defaultStyles.opacity}
                                onChange={(e) => handleStyleChange('opacity', parseFloat(e.target.value))}
                                className="w-full h-1.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                            />
                        </section>

                        {/* Alignment */}
                        {selectedIds.length > 1 && (
                            <section className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Align Objects</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <button onClick={() => alignObjects('left')} className="icon-btn p-3 bg-neutral-50 dark:bg-neutral-800" title="Align Left"><AlignStartHorizontal size={18} /></button>
                                    <button onClick={() => alignObjects('right')} className="icon-btn p-3 bg-neutral-50 dark:bg-neutral-800" title="Align Right"><AlignEndHorizontal size={18} /></button>
                                    <button onClick={() => alignObjects('top')} className="icon-btn p-3 bg-neutral-50 dark:bg-neutral-800" title="Align Top"><AlignStartVertical size={18} /></button>
                                    <button onClick={() => alignObjects('bottom')} className="icon-btn p-3 bg-neutral-50 dark:bg-neutral-800" title="Align Bottom"><AlignEndVertical size={18} /></button>
                                </div>
                            </section>
                        )}

                        {/* Layer List */}
                        <section className="space-y-3 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                <Layers size={14} /> Layers ({objects.length})
                            </label>
                            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                                {objects.slice().reverse().map(obj => (
                                    <div
                                        key={obj.id}
                                        className={`flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${selectedIds.includes(obj.id) ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-700'
                                            }`}
                                    >
                                        <span className="capitalize">{obj.type}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setSelectedIds([obj.id]); bringToFront(); }} className="icon-btn p-1" title="Bring to Front">
                                                <ChevronRight size={14} className="-rotate-90" />
                                            </button>
                                            <button onClick={() => { setSelectedIds([obj.id]); sendToBack(); }} className="icon-btn p-1" title="Send to Back">
                                                <ChevronRight size={14} className="rotate-90" />
                                            </button>
                                            <button onClick={() => toggleLock(obj.id)} className="icon-btn p-1">
                                                {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
                                            </button>
                                            <button onClick={() => deleteObjects([obj.id])} className="icon-btn p-1 text-red-500 hover:bg-red-50">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="p-4 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800 space-y-3 mt-auto">
                        <button
                            onClick={() => exportToJSON(useBoardStore.getState())}
                            className="w-full btn-secondary text-sm py-2"
                        >
                            <Download size={16} /> Export JSON
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => exportToImage(stageRef.current, 'png')}
                                className="btn-secondary text-xs py-2 justify-center"
                            >
                                PNG
                            </button>
                            <button
                                onClick={() => exportToSVG(objects)}
                                className="btn-secondary text-xs py-2 justify-center"
                            >
                                SVG
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
