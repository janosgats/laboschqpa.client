export interface TeamSubmissionStat {
    teamId: number;
    teamName: string;
    submissionCount: number;
}

export interface QrFightArea {
    id: number;
    name: string;
    submissionStats: TeamSubmissionStat[];
    description: string;
    tagCount: number;
}