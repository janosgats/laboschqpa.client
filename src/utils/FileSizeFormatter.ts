const units = ['B', 'KB', 'MB', 'GB'];

function betterRound(x: number, decimals: number = 0) {
    const p = Math.pow(10, decimals);
    return Math.round(x * p) / p;
}

export function FileSizeFormatter(size: number) {
    const unitIndex = Math.min(Math.floor(Math.log2(size) / 10), units.length - 1);
    const sizeWithUnit = size / Math.pow(1024, unitIndex);
    const decimals = Math.max(2 - Math.floor(Math.log10(sizeWithUnit)), 0);
    return `${betterRound(sizeWithUnit, decimals)} ${units[unitIndex]}`;
}
