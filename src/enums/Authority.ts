export enum Authority {
    User = "User",
    NewsPostEditor = "NewsPostEditor",
    ProgramEditor = "ProgramEditor",
    ObjectiveEditor = "ObjectiveEditor",
    RiddleEditor = "RiddleEditor",
    EventEditor = "EventEditor",
    TeamScorer = "TeamScorer",
    SpeedDrinkingEditor = "SpeedDrinkingEditor",
    AcceptedEmailEditor = "AcceptedEmailEditor",
    FileSupervisor = "FileSupervisor",
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
    [Authority.ProgramEditor]: {
        authority: Authority.ProgramEditor,
    },
    [Authority.ObjectiveEditor]: {
        authority: Authority.ObjectiveEditor,
    },
    [Authority.RiddleEditor]: {
        authority: Authority.RiddleEditor,
    },
    [Authority.EventEditor]: {
        authority: Authority.EventEditor,
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
    [Authority.FileSupervisor]: {
        authority: Authority.FileSupervisor,
    },
    [Authority.Admin]: {
        authority: Authority.Admin,
    },
};
