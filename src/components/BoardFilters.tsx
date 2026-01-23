import { SortOption,State } from "@/types";

import { SortSelector } from "./SortSelector";
import { StateSelector } from "./StateSelector";

interface BoardFiltersProps {
  states: State[];
  selectedStateIds: string[];
  onStateChange: (stateIds: string[]) => void;
  sorts: SortOption[];
  onSortsChange: (sorts: SortOption[]) => void;
}

export function BoardFilters({
  states,
  selectedStateIds,
  onStateChange,
  sorts,
  onSortsChange,
}: BoardFiltersProps) {
  return (
    <>
      <StateSelector
        states={states}
        selectedStateIds={selectedStateIds}
        onStateChange={onStateChange}
      />
      <SortSelector sorts={sorts} onSortsChange={onSortsChange} />
    </>
  );
}
