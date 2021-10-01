export enum RiddleCategory {
    NETHER = 1,
    SEVENTH_HEAVEN = 2,
}

export interface RiddleCategoryDataEntry {
    category: RiddleCategory;
    displayName: string;
}

export const riddleCategoryData: Record<RiddleCategory, RiddleCategoryDataEntry> = {
    [RiddleCategory.NETHER]: {
        category: RiddleCategory.NETHER,
        displayName: "Nether",
    },
    [RiddleCategory.SEVENTH_HEAVEN]: {
        category: RiddleCategory.SEVENTH_HEAVEN,
        displayName: "7th Heaven",
    },
};
