export enum SpeedDrinkingCategory {
    BEER = 1,
    RANDOM = 2,
}

export interface SpeedDrinkingCategoryDataEntry {
    category: SpeedDrinkingCategory;
    displayName: string;
}

export const speedDrinkingCategoryData: Record<SpeedDrinkingCategory, SpeedDrinkingCategoryDataEntry> = {
    [SpeedDrinkingCategory.BEER]: {
        category: SpeedDrinkingCategory.BEER,
        displayName: "Beer",
    },
    [SpeedDrinkingCategory.RANDOM]: {
        category: SpeedDrinkingCategory.RANDOM,
        displayName: "Random",
    },
};
