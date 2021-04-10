export enum TeamRole {
    NOTHING = 0,
    APPLIED = 1,
    MEMBER = 2,
    LEADER = 3,
}

export interface TeamRoleDataEntry {
    displayName: string;
    payHoldStatus: TeamRole;
}

export const teamRoleData: Record<TeamRole, TeamRoleDataEntry> = {
    [TeamRole.NOTHING]: {
        payHoldStatus: TeamRole.NOTHING,
        displayName: "Nothing",
    },
    [TeamRole.APPLIED]: {
        payHoldStatus: TeamRole.APPLIED,
        displayName: "Applied",
    },
    [TeamRole.MEMBER]: {
        payHoldStatus: TeamRole.MEMBER,
        displayName: "Member",
    },
    [TeamRole.LEADER]: {
        payHoldStatus: TeamRole.LEADER,
        displayName: "Leader",
    },

};
