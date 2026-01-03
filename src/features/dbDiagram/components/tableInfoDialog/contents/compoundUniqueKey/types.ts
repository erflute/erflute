import { type Table } from "@/types/domain/table";

export type CompoundUniqueKeyProps = {
  data: Table;
  setData: (data: Table | ((data: Table) => Table)) => void;
};
