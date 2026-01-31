import { SortOption, State, SubTribe } from "@/types";

import { SortSelector } from "./SortSelector";
import { StateSelector } from "./StateSelector";
import { SubTribeSelector } from "./SubTribeSelector";

interface BoardFiltersProps {
  states: State[];
  subtribes: SubTribe[];
  selectedStateIds: string[];
  selectedSubtribeIds: string[];
  onStateChange: (stateIds: string[]) => void;
  onSubtribeChange: (subtribeIds: string[]) => void;
  sorts: SortOption[];
  onSortsChange: (sorts: SortOption[]) => void;
}

export function BoardFilters({
  states,
  subtribes,
  selectedStateIds,
  selectedSubtribeIds,
  onStateChange,
  onSubtribeChange,
  sorts,
  onSortsChange,
}: BoardFiltersProps) {
  return (
    <>
      <SubTribeSelector
        subtribes={subtribes}
        selectedSubtribeIds={selectedSubtribeIds}
        onSubtribeChange={onSubtribeChange}
      />
      <StateSelector
        states={states}
        selectedStateIds={selectedStateIds}
        onStateChange={onStateChange}
      />
      <SortSelector sorts={sorts} onSortsChange={onSortsChange} />
    </>
  );
}
