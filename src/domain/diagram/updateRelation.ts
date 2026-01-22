import {
  parseReference,
  stringifyReference,
} from "@/domain/parsers/referenceParser";
import type { Relationship } from "@/types/domain/relationship";

type UpdateRelationAndRefsParams = {
  relationship: Relationship;
  previousTableName: string;
  nextTableName: string;
};

type UpdateRelationParams = {
  relationships: Relationship[];
  relationship: Relationship;
  previousName: string;
};

export const updateRelation = ({
  relationships,
  relationship,
  previousName,
}: UpdateRelationParams): Relationship[] | null => {
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

export const updateRelationAndRefs = ({
  previousTableName,
  nextTableName,
  relationship,
}: UpdateRelationAndRefsParams): Relationship => {
  const renameReference = (reference: string) => {
    const { prefix, tableName } = parseReference(reference);
    if (tableName !== previousTableName) {
      return reference;
    }
    return stringifyReference({
      prefix,
      tableName: nextTableName,
    });
  };

  const nextSource = renameReference(relationship.source);
  const nextTarget = renameReference(relationship.target);

  if (
    nextSource === relationship.source &&
    nextTarget === relationship.target
  ) {
    return relationship;
  }

  return {
    ...relationship,
    source: nextSource,
    target: nextTarget,
  };
};
