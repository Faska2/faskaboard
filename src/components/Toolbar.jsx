import React from 'react';
import {
    MousePointer2,
    Square,
    Circle,
    Minus,
    ArrowRight,
    Pencil,
    Type,
    Image as ImageIcon,
    Eraser,
    Undo2,
    Redo2,
    Grid
} from 'lucide-react';
import { useBoardStore } from '../store/useBoardStore';

const Toolbar = () => {
    const { tool, setTool, undo, redo, history, redoStack, updateCanvas, canvasConfig } = useBoardStore();

    const tools = [
        { id: 'select', icon: MousePointer2, label: 'Select (V)' },
        { id: 'rect', icon: Square, label: 'Rectangle (R)' },
        { id: 'circle', icon: Circle, label: 'Circle (O)' },
        { id: 'line', icon: Minus, label: 'Line (L)' },
        { id: 'arrow', icon: ArrowRight, label: 'Arrow (A)' },
        { id: 'pencil', icon: Pencil, label: 'Pencil (P)' },
        { id: 'text', icon: Type, label: 'Text (T)' },
        { id: 'image', icon: ImageIcon, label: 'Image' },
        { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
    ];

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    useBoardStore.getState().addObject({
                        type: 'image',
                        x: 100,
                        y: 100,
                        width: img.width / 2,
                        height: img.height / 2,
                        src: reader.result,
                        rotation: 0,
                        locked: false,
                        opacity: 1
                    });
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-6 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 flex md:flex-col gap-4 z-40 max-w-[95vw] overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <div className="panel p-2 flex md:flex-col gap-1 items-center">
                {tools.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => t.id === 'image' ? null : setTool(t.id)}
                        className={`icon-btn min-w-[40px] min-h-[40px] relative group ${tool === t.id ? 'active' : ''}`}
                        title={t.label}
                    >
                        {t.id === 'image' ? (
                            <label className="cursor-pointer">
                                <t.icon size={20} />
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                            </label>
                        ) : (
                            <t.icon size={20} />
                        )}
                        <span className="hidden md:block absolute left-full ml-4 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                            {t.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="panel p-2 flex md:flex-col gap-1 items-center">
                <button
                    onClick={undo}
                    disabled={history.length === 0}
                    className="icon-btn min-w-[40px] min-h-[40px] disabled:opacity-30"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo2 size={20} />
                </button>
                <button
                    onClick={redo}
                    disabled={redoStack.length === 0}
                    className="icon-btn min-w-[40px] min-h-[40px] disabled:opacity-30"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo2 size={20} />
                </button>
            </div>

            <div className="panel p-2 flex md:flex-col gap-1 items-center">
                <button
                    onClick={() => updateCanvas({ showGrid: !canvasConfig.showGrid })}
                    className={`icon-btn min-w-[40px] min-h-[40px] ${canvasConfig.showGrid ? 'bg-neutral-100 dark:bg-neutral-800' : ''}`}
                    title="Toggle Grid (G)"
                >
                    <Grid size={20} />
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
