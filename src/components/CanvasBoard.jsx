import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Line, Arrow, Text, Transformer, Group, Image as KonvaImage } from 'react-konva';
import { useBoardStore } from '../store/useBoardStore';
import { v4 as uuidv4 } from 'uuid';

const CanvasBoard = ({ stageRef }) => {
    const {
        objects,
        selectedIds,
        tool,
        addObject,
        updateObject,
        setSelectedIds,
        canvasConfig,
        updateCanvas,
        defaultStyles,
        deleteObjects,
        undo,
        redo,
        duplicateObjects,
        autoSaveToLocal,
        saveHistory
    } = useBoardStore();

    const [isDrawing, setIsDrawing] = useState(false);
    const [newObjectId, setNewObjectId] = useState(null);
    const [selectionBox, setSelectionBox] = useState(null);
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
    const transformerRef = useRef();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            setDimensions({ width: window.innerWidth, height: window.innerHeight });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle Multi-selection visibility
    useEffect(() => {
        if (transformerRef.current) {
            const stage = stageRef.current;
            const selectedNodes = selectedIds.map(id => stage.findOne('#' + id)).filter(Boolean);
            transformerRef.current.nodes(selectedNodes);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [selectedIds, objects]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') { e.preventDefault(); undo(); }
                if (e.key === 'y') { e.preventDefault(); redo(); }
                if (e.key === 'd') { e.preventDefault(); duplicateObjects(); }
            }

            if (e.key === 'Delete' || e.key === 'Backspace') {
                deleteObjects(selectedIds);
            }

            const tools = { 'v': 'select', 'r': 'rect', 'o': 'circle', 'l': 'line', 'a': 'arrow', 'p': 'pencil', 't': 'text', 'e': 'eraser' };
            if (tools[e.key.toLowerCase()]) {
                useBoardStore.getState().setTool(tools[e.key.toLowerCase()]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, undo, redo, deleteObjects, duplicateObjects]);

    // Auto-save timer
    useEffect(() => {
        const interval = setInterval(() => {
            autoSaveToLocal();
        }, 5000);
        return () => clearInterval(interval);
    }, [autoSaveToLocal]);

    const handleMouseDown = (e) => {
        if (e.target === e.target.getStage()) {
            if (tool === 'select') {
                setSelectedIds([]);
                const stagePos = e.target.getStage().getRelativePointerPosition();
                setSelectionBox({ x1: stagePos.x, y1: stagePos.y, x2: stagePos.x, y2: stagePos.y });
            } else {
                startDrawing(e);
            }
            return;
        }

        const target = e.target;
        const clickedId = target.id() || target.parent?.id();

        if (tool === 'select') {
            if (e.evt.shiftKey) {
                setSelectedIds(selectedIds.includes(clickedId) ? selectedIds.filter(id => id !== clickedId) : [...selectedIds, clickedId]);
            } else if (!selectedIds.includes(clickedId)) {
                setSelectedIds([clickedId]);
            }
        } else if (tool === 'eraser') {
            deleteObjects([clickedId]);
        }
    };

    const startDrawing = (e) => {
        setIsDrawing(true);
        const pos = e.target.getStage().getRelativePointerPosition();
        const id = uuidv4();
        setNewObjectId(id);

        const baseObj = {
            id,
            strokeColor: defaultStyles.strokeColor,
            fillColor: defaultStyles.fillColor,
            strokeWidth: defaultStyles.strokeWidth,
            opacity: defaultStyles.opacity,
            x: pos.x,
            y: pos.y,
            rotation: 0,
            locked: false,
        };

        let newObj;
        if (tool === 'rect') newObj = { ...baseObj, type: 'rect', width: 1, height: 1 };
        else if (tool === 'circle') newObj = { ...baseObj, type: 'circle', radius: 1, width: 1, height: 1 };
        else if (tool === 'line') newObj = { ...baseObj, type: 'line', points: [0, 0, 0, 0] };
        else if (tool === 'arrow') newObj = { ...baseObj, type: 'arrow', points: [0, 0, 0, 0] };
        else if (tool === 'pencil') newObj = { ...baseObj, type: 'pencil', points: [0, 0] };
        else if (tool === 'text') {
            const text = prompt('Enter text:', 'New Text');
            if (text) {
                addObject({ ...baseObj, type: 'text', textContent: text, fontSize: 24, strokeColor: defaultStyles.strokeColor }, true);
            }
            setIsDrawing(false);
            return;
        }

        if (newObj) {
            addObject(newObj, true);
            setSelectedIds([id]);
        }
    };

    const handleMouseMove = (e) => {
        const stage = e.target.getStage();
        const pos = stage.getRelativePointerPosition();

        if (selectionBox) {
            setSelectionBox(prev => ({ ...prev, x2: pos.x, y2: pos.y }));
            return;
        }

        if (!isDrawing || !newObjectId) return;

        // Use getState() to get the latest objects during rapid mouse moves
        const currentObjects = useBoardStore.getState().objects;
        const obj = currentObjects.find(o => o.id === newObjectId);
        if (!obj) return;

        const updates = {};
        if (tool === 'rect' || tool === 'circle') {
            updates.width = pos.x - obj.x;
            updates.height = pos.y - obj.y;
        } else if (tool === 'line' || tool === 'arrow') {
            updates.points = [0, 0, pos.x - obj.x, pos.y - obj.y];
        } else if (tool === 'pencil') {
            // Add point only if mouse moved enough (optimization)
            const lastX = obj.points[obj.points.length - 2];
            const lastY = obj.points[obj.points.length - 1];
            const dist = Math.sqrt(Math.pow(pos.x - obj.x - lastX, 2) + Math.pow(pos.y - obj.y - lastY, 2));
            if (dist > 2) {
                updates.points = [...obj.points, pos.x - obj.x, pos.y - obj.y];
            } else {
                return;
            }
        }

        updateObject(newObjectId, updates, false);
    };

    const handleMouseUp = (e) => {
        if (selectionBox) {
            const { x1, y1, x2, y2 } = selectionBox;
            const box = {
                x: Math.min(x1, x2),
                y: Math.min(y1, y2),
                width: Math.abs(x2 - x1),
                height: Math.abs(y2 - y1)
            };
            const currentObjects = useBoardStore.getState().objects;
            const inBox = currentObjects.filter(obj => {
                return obj.x >= box.x && obj.x + (obj.width || 0) <= box.x + box.width &&
                    obj.y >= box.y && obj.y + (obj.height || 0) <= box.y + box.height;
            }).map(o => o.id);
            if (inBox.length > 0) setSelectedIds(inBox);
            setSelectionBox(null);
        }
        setIsDrawing(false);
        setNewObjectId(null);
    };

    const handleWheel = (e) => {
        e.evt.preventDefault();
        const scaleBy = 1.1;
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale,
        };
        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        updateCanvas({
            zoom: newScale,
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        });
    };

    const gridLines = [];
    if (canvasConfig.showGrid) {
        const size = 50;
        for (let i = -2000; i < 4000; i += size) {
            gridLines.push(<Line key={`h${i}`} points={[-2000, i, 4000, i]} stroke="#e5e7eb" strokeWidth={0.5} />);
            gridLines.push(<Line key={`v${i}`} points={[i, -2000, i, 4000]} stroke="#e5e7eb" strokeWidth={0.5} />);
        }
    }

    return (
        <div className={`w-full h-screen ${canvasConfig.darkMode ? 'bg-neutral-950' : 'bg-neutral-50'}`}>
            <Stage
                width={dimensions.width}
                height={dimensions.height}
                scaleX={canvasConfig.zoom}
                scaleY={canvasConfig.zoom}
                x={canvasConfig.x}
                y={canvasConfig.y}
                ref={stageRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onWheel={handleWheel}
                draggable={tool === 'select' && selectedIds.length === 0}
                onDragEnd={(e) => {
                    if (e.target === stageRef.current) {
                        updateCanvas({ x: e.target.x(), y: e.target.y() });
                    }
                }}
            >
                <Layer>
                    {gridLines}
                    {objects.map((obj) => (
                        <Group
                            key={obj.id} id={obj.id} x={obj.x} y={obj.y}
                            draggable={!obj.locked && tool === 'select'}
                            onDragStart={() => saveHistory()}
                            onDragEnd={(e) => updateObject(obj.id, { x: e.target.x(), y: e.target.y() }, false)}
                            onClick={(e) => { if (tool === 'eraser') deleteObjects([obj.id]); }}
                        >
                            {obj.type === 'rect' && (
                                <Rect
                                    width={obj.width} height={obj.height}
                                    stroke={obj.strokeColor} fill={obj.fillColor === 'transparent' ? undefined : obj.fillColor}
                                    strokeWidth={obj.strokeWidth} opacity={obj.opacity} cornerRadius={4}
                                />
                            )}
                            {obj.type === 'circle' && (
                                <Circle
                                    radius={Math.max(1, Math.sqrt(obj.width ** 2 + obj.height ** 2))}
                                    stroke={obj.strokeColor} fill={obj.fillColor === 'transparent' ? undefined : obj.fillColor}
                                    strokeWidth={obj.strokeWidth} opacity={obj.opacity}
                                />
                            )}
                            {(obj.type === 'line' || obj.type === 'pencil') && (
                                <Line
                                    points={obj.points} stroke={obj.strokeColor}
                                    strokeWidth={obj.strokeWidth} opacity={obj.opacity}
                                    lineCap="round" lineJoin="round" tension={obj.type === 'pencil' ? 0.3 : 0}
                                />
                            )}
                            {obj.type === 'arrow' && (
                                <Arrow
                                    points={obj.points} stroke={obj.strokeColor} fill={obj.strokeColor}
                                    strokeWidth={obj.strokeWidth} opacity={obj.opacity}
                                    pointerLength={10} pointerWidth={10}
                                />
                            )}
                            {obj.type === 'text' && (
                                <Text
                                    text={obj.textContent} fontSize={obj.fontSize} fill={obj.strokeColor}
                                    opacity={obj.opacity} fontFamily={obj.fontFamily}
                                />
                            )}
                            {obj.type === 'image' && (
                                <StageImage src={obj.src} width={obj.width} height={obj.height} opacity={obj.opacity} />
                            )}
                        </Group>
                    ))}

                    {tool === 'select' && selectedIds.length > 0 && (
                        <Transformer
                            ref={transformerRef}
                            onTransformStart={() => saveHistory()}
                            onTransformEnd={() => {
                                const nodes = transformerRef.current.nodes();
                                nodes.forEach(node => {
                                    updateObject(node.id(), {
                                        x: node.x(), y: node.y(),
                                        width: node.width() * node.scaleX(),
                                        height: node.height() * node.scaleY(),
                                        rotation: node.rotation(),
                                    }, false);
                                    node.setAttrs({ scaleX: 1, scaleY: 1 });
                                });
                            }}
                        />
                    )}

                    {selectionBox && (
                        <Rect
                            x={Math.min(selectionBox.x1, selectionBox.x2)} y={Math.min(selectionBox.y1, selectionBox.y2)}
                            width={Math.abs(selectionBox.x2 - selectionBox.x1)} height={Math.abs(selectionBox.y2 - selectionBox.y1)}
                            fill="rgba(0, 161, 255, 0.1)" stroke="rgba(0, 161, 255, 0.3)" strokeWidth={1}
                        />
                    )}
                </Layer>
            </Stage>
        </div>
    );
};

const StageImage = ({ src, width, height, opacity }) => {
    const [image, setImage] = useState(null);
    useEffect(() => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => setImage(img);
    }, [src]);
    return image ? <KonvaImage image={image} width={width} height={height} opacity={opacity} /> : null;
};

export default CanvasBoard;
