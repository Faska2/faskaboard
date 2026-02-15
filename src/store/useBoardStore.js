import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const INITIAL_STATE = {
    objects: [],
    selectedIds: [],
    tool: 'select',
    canvasConfig: {
        zoom: 1,
        x: 0,
        y: 0,
        showGrid: true,
        darkMode: false,
    },
    defaultStyles: {
        strokeColor: '#000000',
        fillColor: '#000000',
        strokeWidth: 2,
        opacity: 1,
        fontSize: 18,
        fontFamily: 'sans-serif',
    },
    history: [],
    redoStack: [],
};

export const useBoardStore = create((set, get) => ({
    ...INITIAL_STATE,

    saveHistory: () => {
        const { objects, history } = get();
        // Only save if the current state is different from the last history entry
        if (history.length > 0 && JSON.stringify(history[history.length - 1]) === JSON.stringify(objects)) return;
        set({ history: [...history, objects].slice(-50), redoStack: [] });
    },

    addObject: (newObj, shouldSaveHistory = true) => {
        if (shouldSaveHistory) get().saveHistory();
        const { objects } = get();
        // Use existing ID if provided, otherwise generate one
        const objWithId = { ...newObj, id: newObj.id || uuidv4() };
        set({ objects: [...objects, objWithId] });
        return objWithId;
    },

    updateObject: (id, updates, shouldSaveHistory = false) => {
        if (shouldSaveHistory) get().saveHistory();
        const { objects } = get();
        const updatedObjects = objects.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj));
        set({ objects: updatedObjects });
    },

    deleteObjects: (ids) => {
        if (!ids || ids.length === 0) return;
        get().saveHistory();
        const { objects } = get();
        const updatedObjects = objects.filter((obj) => !ids.includes(obj.id));
        set({
            objects: updatedObjects,
            selectedIds: [],
        });
    },

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    setTool: (tool) => set({ tool }),

    updateCanvas: (updates) => set((state) => ({ canvasConfig: { ...state.canvasConfig, ...updates } })),

    updateDefaultStyles: (updates) => set((state) => ({ defaultStyles: { ...state.defaultStyles, ...updates } })),

    undo: () => {
        const { history, objects, redoStack } = get();
        if (history.length === 0) return;

        const previousState = history[history.length - 1];
        set({
            objects: previousState,
            history: history.slice(0, -1),
            redoStack: [objects, ...redoStack],
        });
    },

    redo: () => {
        const { redoStack, objects, history } = get();
        if (redoStack.length === 0) return;

        const nextState = redoStack[0];
        set({
            objects: nextState,
            redoStack: redoStack.slice(1),
            history: [...history, objects],
        });
    },

    setBoardState: (newState) => set(newState),

    resetBoard: () => set(INITIAL_STATE),

    toggleLock: (id) => {
        const { objects } = get();
        set({
            objects: objects.map(obj => obj.id === id ? { ...obj, locked: !obj.locked } : obj)
        });
    },

    duplicateObjects: () => {
        const { objects, selectedIds } = get();
        if (selectedIds.length === 0) return;

        get().saveHistory();
        const duplicated = objects.filter(obj => selectedIds.includes(obj.id)).map(obj => ({
            ...obj,
            id: uuidv4(),
            x: obj.x + 20,
            y: obj.y + 20,
        }));

        set({
            objects: [...objects, ...duplicated],
            selectedIds: duplicated.map(d => d.id),
        });
    },

    bringToFront: () => {
        const { objects, selectedIds } = get();
        const others = objects.filter(obj => !selectedIds.includes(obj.id));
        const selected = objects.filter(obj => selectedIds.includes(obj.id));
        set({ objects: [...others, ...selected] });
    },

    sendToBack: () => {
        const { objects, selectedIds } = get();
        const others = objects.filter(obj => !selectedIds.includes(obj.id));
        const selected = objects.filter(obj => selectedIds.includes(obj.id));
        set({ objects: [...selected, ...others] });
    },

    alignObjects: (direction) => {
        const { objects, selectedIds } = get();
        if (selectedIds.length < 2) return;

        get().saveHistory();
        const selected = objects.filter(obj => selectedIds.includes(obj.id));
        let val;

        if (direction === 'left') {
            val = Math.min(...selected.map(o => o.x));
            set({ objects: objects.map(o => selectedIds.includes(o.id) ? { ...o, x: val } : o) });
        } else if (direction === 'right') {
            val = Math.max(...selected.map(o => o.x + (o.width || 0)));
            set({ objects: objects.map(o => selectedIds.includes(o.id) ? { ...o, x: val - (o.width || 0) } : o) });
        } else if (direction === 'top') {
            val = Math.min(...selected.map(o => o.y));
            set({ objects: objects.map(o => selectedIds.includes(o.id) ? { ...o, y: val } : o) });
        } else if (direction === 'bottom') {
            val = Math.max(...selected.map(o => o.y + (o.height || 0)));
            set({ objects: objects.map(o => selectedIds.includes(o.id) ? { ...o, y: val - (o.height || 0) } : o) });
        }
    },

    autoSaveToLocal: () => {
        const state = get();
        localStorage.setItem('faska_last_board', JSON.stringify({
            objects: state.objects,
            canvasConfig: state.canvasConfig,
            defaultStyles: state.defaultStyles
        }));
    }
}));
