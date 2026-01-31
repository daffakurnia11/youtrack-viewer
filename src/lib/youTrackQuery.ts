import { SortOption, State, SubTribe } from "@/types"

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

export function buildSubtribeFilter(subtribes: SubTribe[], selectedSubtribeIds: string[]): string {
  if (selectedSubtribeIds.length === 0) return ""

  const selectedSubtribes = subtribes.filter((s) => selectedSubtribeIds.includes(s.id))
  return selectedSubtribes
    .map((s) => {
      const subtribeName = s.name.includes(" ") ? `{${s.name}}` : s.name
      return `SubTribe: ${subtribeName}`
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
  subtribeFilter: string,
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
    subtribeFilter,
    sortFilter,
  ].filter(Boolean)

  return parts.join(" ")
}

export const DEFAULT_ISSUE_FIELDS =
  "id,idReadable,summary,reporter(id,name,fullName),updater(id,name,fullName),resolved,updated,created,fields(value(id,presentation,name,localizedName,color(id,background,foreground))),project(name,shortName),tags(id,name,color(id,background,foreground))"
