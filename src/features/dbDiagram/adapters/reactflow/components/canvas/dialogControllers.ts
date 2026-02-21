import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Edge, Node } from "@xyflow/react";
import type { Relationship } from "@/types/domain/relationship";
import type { Table } from "@/types/domain/table";
import {
  createRelationInfoDialogHandlers,
  createTableInfoDialogHandlers,
} from "./handlers";

type TableNode = Node<Table>;
type RelationshipEdge = Edge<Relationship>;

type UseTableInfoDialogControllerArgs = {
  nodes: TableNode[];
  setNodes: Dispatch<SetStateAction<TableNode[]>>;
  setEdges: Dispatch<SetStateAction<RelationshipEdge[]>>;
  updateTable: (table: Table, previousPhysicalName: string) => void;
};

export function useTableInfoDialogController({
  nodes,
  setNodes,
  setEdges,
  updateTable,
}: UseTableInfoDialogControllerArgs) {
  const [tidNodeId, setTidNodeId] = useState<string | null>(null);
  const [tableInfoDialogOpen, setTableInfoDialogOpen] = useState(false);
  const dialogNodeClearTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearTidNode = useCallback(() => {
    if (dialogNodeClearTimeoutRef.current) {
      clearTimeout(dialogNodeClearTimeoutRef.current);
      dialogNodeClearTimeoutRef.current = null;
    }
    setTidNodeId(null);
  }, []);

  const scheduleTidNodeClear = useCallback(() => {
    if (dialogNodeClearTimeoutRef.current) {
      clearTimeout(dialogNodeClearTimeoutRef.current);
    }
    // TableInfoDialog defers handlers after close animation, so keep context briefly.
    dialogNodeClearTimeoutRef.current = setTimeout(() => {
      setTidNodeId(null);
      dialogNodeClearTimeoutRef.current = null;
    }, 300);
  }, []);

  const openTableInfoDialog = useCallback((tableNodeId: string) => {
    if (dialogNodeClearTimeoutRef.current) {
      clearTimeout(dialogNodeClearTimeoutRef.current);
      dialogNodeClearTimeoutRef.current = null;
    }
    setTidNodeId(tableNodeId);
    setTableInfoDialogOpen(true);
  }, []);

  const tidNode = nodes.find((node) => node.id === tidNodeId);
  const tableInfoDialogHandlers = tidNode
    ? createTableInfoDialogHandlers({
        tidNode,
        updateTable,
        setNodes,
        setEdges,
        setTableInfoDialogOpen,
        clearTidNode,
        scheduleTidNodeClear,
      })
    : null;

  useEffect(() => {
    return () => {
      if (dialogNodeClearTimeoutRef.current) {
        clearTimeout(dialogNodeClearTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tidNodeId && !tidNode) {
      setTableInfoDialogOpen(false);
      clearTidNode();
    }
  }, [clearTidNode, tidNode, tidNodeId]);

  return {
    tidNode,
    tableInfoDialogOpen,
    openTableInfoDialog,
    tableInfoDialogHandlers,
  };
}

type UseRelationInfoDialogControllerArgs = {
  edges: RelationshipEdge[];
  setEdges: Dispatch<SetStateAction<RelationshipEdge[]>>;
  updateRelationship: (
    relationship: Relationship,
    previousName: string,
  ) => void;
};

export function useRelationInfoDialogController({
  edges,
  setEdges,
  updateRelationship,
}: UseRelationInfoDialogControllerArgs) {
  const [ridEdgeId, setRidEdgeId] = useState<string | null>(null);
  const [relationInfoDialogOpen, setRelationInfoDialogOpen] = useState(false);
  const dialogEdgeClearTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const clearRidEdge = useCallback(() => {
    if (dialogEdgeClearTimeoutRef.current) {
      clearTimeout(dialogEdgeClearTimeoutRef.current);
      dialogEdgeClearTimeoutRef.current = null;
    }
    setRidEdgeId(null);
  }, []);

  const scheduleRidEdgeClear = useCallback(() => {
    if (dialogEdgeClearTimeoutRef.current) {
      clearTimeout(dialogEdgeClearTimeoutRef.current);
    }
    // RelationInfoDialog defers handlers after close animation, so keep context briefly.
    dialogEdgeClearTimeoutRef.current = setTimeout(() => {
      setRidEdgeId(null);
      dialogEdgeClearTimeoutRef.current = null;
    }, 300);
  }, []);

  const openRelationInfoDialog = useCallback((edgeId: string) => {
    if (dialogEdgeClearTimeoutRef.current) {
      clearTimeout(dialogEdgeClearTimeoutRef.current);
      dialogEdgeClearTimeoutRef.current = null;
    }
    setRidEdgeId(edgeId);
    setRelationInfoDialogOpen(true);
  }, []);

  const ridEdge = edges.find((edge) => edge.id === ridEdgeId);
  const relationInfoDialogHandlers = ridEdgeId && ridEdge?.data
    ? createRelationInfoDialogHandlers({
        ridEdgeId,
        updateRelationship,
        setEdges,
        setRelationInfoDialogOpen,
        clearRidEdge,
        scheduleRidEdgeClear,
      })
    : null;

  useEffect(() => {
    return () => {
      if (dialogEdgeClearTimeoutRef.current) {
        clearTimeout(dialogEdgeClearTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (ridEdgeId && !ridEdge) {
      setRelationInfoDialogOpen(false);
      clearRidEdge();
    }
  }, [clearRidEdge, ridEdge, ridEdgeId]);

  return {
    ridEdge,
    relationInfoDialogOpen,
    openRelationInfoDialog,
    relationInfoDialogHandlers,
  };
}
