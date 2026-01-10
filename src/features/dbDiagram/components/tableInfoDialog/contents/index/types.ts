import type { Table } from "@/types/domain/table";

export type IndexContentProps = {
  data: Table;
  setData: (data: Table | ((data: Table) => Table)) => void;
};
