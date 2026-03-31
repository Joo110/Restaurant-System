export type ApiBranch = {
  id?: string;
  _id?: string;
  branchId?: number | string;
  name: string;
};

export function getBranchId(branch: ApiBranch | undefined): string | undefined {
  if (!branch) return undefined;
  if (branch.id) return String(branch.id);
  if (branch._id) return String(branch._id);
  if (branch.branchId != null) return String(branch.branchId);
  return undefined;
}