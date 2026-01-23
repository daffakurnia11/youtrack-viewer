import { SortOption,State } from "@/types"

export function buildStateFilter(states: State[], selectedStateIds: string[]): string {
  if (selectedStateIds.length === 0) return ""

  const selectedStates = states.filter((s) => selectedStateIds.includes(s.id))
  return selectedStates
    .map((s) => {
      const stateName = s.name.includes(" ") ? `{${s.name}}` : s.name
      return `State: ${stateName}`
    })
    .join(" ")
}

export function buildSortFilter(sorts: SortOption[]): string {
  if (sorts.length === 0) return ""

  return sorts.map((sort) => `sort by: ${sort.field} ${sort.direction}`).join(" ")
}

export function buildQuery(
  sprintName: string,
  stateFilter: string,
  sortFilter: string,
  queryPrefix: string = ""
): string {
  // Build the sprint part
  const sprintPart = queryPrefix
    ? `${queryPrefix} {${sprintName}}`
    : `{${sprintName}}`

  const parts = [
    sprintPart,
    stateFilter,
    sortFilter,
  ].filter(Boolean)

  return parts.join(" ")
}

export const DEFAULT_ISSUE_FIELDS =
  "id,idReadable,summary,reporter(id,name,fullName),updater(id,name,fullName),resolved,updated,created,fields(value(id,presentation,name,localizedName,color(id,background,foreground))),project(name,shortName),tags(id,name,color(id,background,foreground))"
