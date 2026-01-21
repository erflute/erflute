import type { Relationship } from "@/types/domain/relationship";

type UpdateRelationshipParams = {
  relationships: Relationship[];
  relationship: Relationship;
  previousName: string;
};

export const updateRelationshipBy = ({
  relationships,
  relationship,
  previousName,
}: UpdateRelationshipParams): Relationship[] | null => {
  const relationshipIndex = relationships.findIndex(
    (item) => item.name === previousName,
  );
  if (relationshipIndex === -1) {
    return null;
  }
  const nextRelationships = relationships.slice();
  nextRelationships[relationshipIndex] = relationship;
  return nextRelationships;
};
