export const saveBoard = (boardData) => {
    const boards = JSON.parse(localStorage.getItem('faska_recent_boards') || '[]');
    const newBoard = {
        ...boardData,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('faska_recent_boards', JSON.stringify([newBoard, ...boards].slice(0, 10)));
    localStorage.setItem('faska_last_board', JSON.stringify(newBoard));
};

export const loadLastBoard = () => {
    const last = localStorage.getItem('faska_last_board');
    return last ? JSON.parse(last) : null;
};

export const loadRecentBoards = () => {
    return JSON.parse(localStorage.getItem('faska_recent_boards') || '[]');
};

export const deleteRecentBoard = (id) => {
    const boards = JSON.parse(localStorage.getItem('faska_recent_boards') || '[]');
    const filtered = boards.filter(b => b.id !== id);
    localStorage.setItem('faska_recent_boards', JSON.stringify(filtered));
};
