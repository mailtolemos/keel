// Enum-like constants (SQLite stores these as strings)
export const Role = { ADMIN: "ADMIN", MANAGER: "MANAGER", EMPLOYEE: "EMPLOYEE" } as const;
export const EmployeeStatus = { ACTIVE: "ACTIVE", INVITED: "INVITED", OFFBOARDING: "OFFBOARDING", INACTIVE: "INACTIVE" } as const;
export const LeaveType = { VACATION: "VACATION", SICK: "SICK", PARENTAL: "PARENTAL", UNPAID: "UNPAID", CUSTOM: "CUSTOM" } as const;
export const LeaveStatus = { PENDING: "PENDING", APPROVED: "APPROVED", REJECTED: "REJECTED", CANCELLED: "CANCELLED" } as const;
export const CycleStatus = { DRAFT: "DRAFT", ACTIVE: "ACTIVE", CLOSED: "CLOSED", RELEASED: "RELEASED" } as const;
export const ReviewKind = { SELF: "SELF", MANAGER: "MANAGER", PEER: "PEER", UPWARD: "UPWARD" } as const;
export const ResponseStatus = { NOT_STARTED: "NOT_STARTED", IN_PROGRESS: "IN_PROGRESS", SUBMITTED: "SUBMITTED" } as const;
export const FeedbackVisibility = { PRIVATE: "PRIVATE", MANAGER_ONLY: "MANAGER_ONLY", PUBLIC: "PUBLIC" } as const;
export const GoalLevel = { COMPANY: "COMPANY", TEAM: "TEAM", INDIVIDUAL: "INDIVIDUAL" } as const;
export const GoalStatus = { ON_TRACK: "ON_TRACK", AT_RISK: "AT_RISK", OFF_TRACK: "OFF_TRACK", DONE: "DONE", NOT_STARTED: "NOT_STARTED" } as const;
export const InviteStatus = { PENDING: "PENDING", ACCEPTED: "ACCEPTED", REVOKED: "REVOKED" } as const;

export const LEAVE_TYPE_LABEL: Record<string, string> = {
  VACATION: "Vacation", SICK: "Sick leave", PARENTAL: "Parental leave", UNPAID: "Unpaid leave", CUSTOM: "Custom"
};
export const FEEDBACK_TAGS = ["Strength", "Improvement", "Collaboration", "Leadership", "Execution", "Culture"] as const;
export const GOAL_STATUS_LABEL: Record<string, string> = {
  ON_TRACK: "On track", AT_RISK: "At risk", OFF_TRACK: "Off track", DONE: "Done", NOT_STARTED: "Not started"
};
