export class UniqueValueIndexer {
    currentIndex: number;

    seenValues: Set<any> = new Set<any>();

    constructor(currentIndex: number = 1) {
        this.currentIndex = currentIndex;
    }

    getIndex(checkedValue: any): number | null {
        if (this.seenValues.has(checkedValue)) {
            return null;
        }
        this.seenValues.add(checkedValue);
        return this.currentIndex++;
    }
}