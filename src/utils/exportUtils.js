import { saveAs } from 'file-saver';

export const exportToJSON = (state) => {
    const data = {
        objects: state.objects,
        canvasConfig: state.canvasConfig,
        defaultStyles: state.defaultStyles,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    saveAs(blob, `faska-board-${new Date().getTime()}.json`);
};

export const exportToImage = (stage, format = 'png') => {
    if (!stage) return;
    const dataURL = stage.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `faska-board-${new Date().getTime()}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToSVG = (objects) => {
    // Simple SVG export logic
    const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="2000" height="2000">
      ${objects.map(obj => {
        if (obj.type === 'rect') return `<rect x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" stroke="${obj.strokeColor}" fill="${obj.fillColor || 'none'}" stroke-width="${obj.strokeWidth}" opacity="${obj.opacity}" />`;
        if (obj.type === 'circle') return `<circle cx="${obj.x}" cy="${obj.y}" r="${Math.abs(obj.width / 2)}" stroke="${obj.strokeColor}" fill="${obj.fillColor || 'none'}" stroke-width="${obj.strokeWidth}" opacity="${obj.opacity}" />`;
        if (obj.type === 'line' || obj.type === 'pencil') return `<polyline points="${obj.points.map((p, i) => i % 2 === 0 ? p + obj.x : p + obj.y).join(',')}" fill="none" stroke="${obj.strokeColor}" stroke-width="${obj.strokeWidth}" opacity="${obj.opacity}" />`;
        if (obj.type === 'text') return `<text x="${obj.x}" y="${obj.y}" fill="${obj.strokeColor}" font-size="${obj.fontSize}" opacity="${obj.opacity}">${obj.textContent}</text>`;
        return '';
    }).join('')}
    </svg>
  `;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    saveAs(blob, `faska-board-${new Date().getTime()}.svg`);
};
