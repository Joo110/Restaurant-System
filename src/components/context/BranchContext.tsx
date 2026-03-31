import { createContext, useState, ReactNode } from "react";
import type { ApiBranch } from "./branch.types";

interface BranchContextValue {
  selectedBranch: ApiBranch | null;
  setSelectedBranch: (branch: ApiBranch | null) => void;
}

const BranchContext = createContext<BranchContextValue | undefined>(undefined);

export function BranchProvider({ children }: { children: ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<ApiBranch | null>(null);

  return (
    <BranchContext.Provider value={{ selectedBranch, setSelectedBranch }}>
      {children}
    </BranchContext.Provider>
  );
}

export default BranchContext;