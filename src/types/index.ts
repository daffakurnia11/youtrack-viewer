// Board and Sprint Types
export interface Sprint {
  id: string
  name: string
  start: string
  finish: string
  ordinal?: number
  goal?: string
  archived?: boolean
  isDefault?: boolean
  isStarted?: boolean
}

export interface State {
  id: string
  name: string
  color?: {
    background?: string
    foreground?: string
  }
}

export interface SubTribe {
  id: string
  name: string
  color?: string
}

export interface Board {
  id: string
  name: string
  currentSprint?: { id: string }
  sprints: Sprint[]
  states: State[]
  subtribes: SubTribe[]
}

// Issue Types
export interface IssueFieldValue {
  id: string
  name?: string
  localizedName?: string
  presentation?: string
  color?: {
    id: string
    background?: string
    foreground?: string
  }
  $type?: string
}

export interface IssueField {
  value: IssueFieldValue | number | null | IssueFieldValue[] | UserFieldValue
  $type: string
}

export interface UserFieldValue {
  id: string
  name?: string
  fullName?: string
  $type?: string
}

export interface Reporter {
  fullName?: string
  name?: string
}

export interface Issue {
  id: string
  idReadable: string
  summary: string
  created: string
  updated: string
  resolved?: number | string
  reporter?: Reporter
  updater?: Reporter
  tags?: Array<{
    id: string
    name: string
    color?: {
      background?: string
      foreground?: string
    }
  }>
  project?: {
    shortName: string
    name: string
  }
  fields?: IssueField[]
  $type?: string
}

// Sort Types
export type SortField = "SubTribe" | "{issue id}" | "{Story Points}" | "State"
export type SortDirection = "asc" | "desc"

export interface SortOption {
  field: SortField
  direction: SortDirection
}

// API Response Types
export type BoardData = Board
export type IssuesData = Issue[]
