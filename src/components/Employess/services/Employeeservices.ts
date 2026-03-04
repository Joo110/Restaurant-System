import { useQuery } from "@tanstack/react-query";
import type { EmployeesListResponse, EmployeesQueryParams } from "../services/employeeService";
import { getEmployees } from "../services/employeeService";

export const useEmployees = (params?: EmployeesQueryParams) => {
  return useQuery<EmployeesListResponse, Error>({
    queryKey: ["employees", params ?? {}],
    queryFn: async () => await getEmployees(params),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 2,
  });
};