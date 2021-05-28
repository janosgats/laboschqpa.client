export enum TeamRole {
    NOTHING = 0,
    APPLIED = 1,
    MEMBER = 2,
    LEADER = 3,
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
    [TeamRole.APPLIED]: {
        teamRole: TeamRole.APPLIED,
        displayName: "Applied",
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
