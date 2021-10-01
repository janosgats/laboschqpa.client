export enum RiddleCategory {
    BEST = 1,
    EVEN_BETTER = 2,
}

export interface RiddleCategoryDataEntry {
    category: RiddleCategory;
    displayName: string;
}

export const riddleCategoryData: Record<RiddleCategory, RiddleCategoryDataEntry> = {
    [RiddleCategory.BEST]: {
        category: RiddleCategory.BEST,
        displayName: "Best",
    },
    [RiddleCategory.EVEN_BETTER]: {
        category: RiddleCategory.EVEN_BETTER,
        displayName: "Even better",
    },
};
