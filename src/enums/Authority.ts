export enum Authority {
    User = "User",
    NewsPostEditor = "NewsPostEditor",
    ObjectiveEditor = "ObjectiveEditor",
    RiddleEditor = "RiddleEditor",
    TeamScorer = "TeamScorer",
    SpeedDrinkingEditor = "SpeedDrinkingEditor",
    AcceptedEmailEditor = "AcceptedEmailEditor",
    Admin = "Admin",
}


export interface AuthorityDataEntry {
    authority: Authority;
}

export const authorityData: Record<Authority, AuthorityDataEntry> = {
    [Authority.User]: {
        authority: Authority.User,
    },
    [Authority.NewsPostEditor]: {
        authority: Authority.NewsPostEditor,
    },
    [Authority.ObjectiveEditor]: {
        authority: Authority.ObjectiveEditor,
    },
    [Authority.RiddleEditor]: {
        authority: Authority.RiddleEditor,
    },
    [Authority.TeamScorer]: {
        authority: Authority.TeamScorer,
    },
    [Authority.SpeedDrinkingEditor]: {
        authority: Authority.SpeedDrinkingEditor,
    },
    [Authority.AcceptedEmailEditor]: {
        authority: Authority.AcceptedEmailEditor,
    },
    [Authority.Admin]: {
        authority: Authority.Admin,
    },
};
