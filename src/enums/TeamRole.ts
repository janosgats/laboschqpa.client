export enum TeamRole {
    NOTHING = 1,
    APPLICANT = 2,
    MEMBER = 3,
    LEADER = 4,
}

export interface TeamRoleDataEntry {
    displayName: string;
    teamRole: TeamRole;
}

export const teamRoleData: Record<TeamRole, TeamRoleDataEntry> = {
    [TeamRole.NOTHING]: {
        teamRole: TeamRole.NOTHING,
        displayName: "Nothing",
    },
    [TeamRole.APPLICANT]: {
        teamRole: TeamRole.APPLICANT,
        displayName: "Applicant",
    },
    [TeamRole.MEMBER]: {
        teamRole: TeamRole.MEMBER,
        displayName: "Member",
    },
    [TeamRole.LEADER]: {
        teamRole: TeamRole.LEADER,
        displayName: "Leader",
    },

};
