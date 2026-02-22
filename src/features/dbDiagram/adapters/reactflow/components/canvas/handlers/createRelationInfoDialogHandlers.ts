import type { Dispatch, SetStateAction } from "react";
import type { Edge } from "@xyflow/react";
import type { Relationship } from "@/types/domain/relationship";

type RelationshipEdge = Edge<Relationship>;

type RelationInfoDialogHandlerArgs = {
  ridEdgeId: string;
  updateRelationship: (
    relationship: Relationship,
    previousName: string,
  ) => void;
  setEdges: Dispatch<SetStateAction<RelationshipEdge[]>>;
  setRelationInfoDialogOpen: (open: boolean) => void;
  clearRidEdge: () => void;
  scheduleRidEdgeClear: () => void;
};

export function createRelationInfoDialogHandlers({
  ridEdgeId,
  updateRelationship,
  setEdges,
  setRelationInfoDialogOpen,
  clearRidEdge,
  scheduleRidEdgeClear,
}: RelationInfoDialogHandlerArgs) {
  const handleOpenChange = (open: boolean) => {
    setRelationInfoDialogOpen(open);
    if (!open) {
      scheduleRidEdgeClear();
    }
  };

  const handleApply = (updatedRelationship: Relationship) => {
    updateRelationship(updatedRelationship, ridEdgeId);
    setEdges((currentEdges) =>
      currentEdges.map((edge) =>
        edge.id === ridEdgeId
          ? {
              ...edge,
              id: updatedRelationship.name,
              data: updatedRelationship,
            }
          : edge,
      ),
    );
    setRelationInfoDialogOpen(false);
    clearRidEdge();
  };

  const handleCancel = () => {
    setRelationInfoDialogOpen(false);
    clearRidEdge();
  };

  return {
    handleOpenChange,
    handleApply,
    handleCancel,
  };
}
