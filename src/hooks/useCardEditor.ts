import { useState, useCallback } from "react";
import type {
  CardTemplate,
  UserCardContent,
  ImageElement,
} from "@/types/cardTemplate";
import { createDefaultUserContent } from "@/types/cardTemplate";

export interface ImageTransform {
  scale: number; // zoom level
  offsetX: number; // percentage of slot width (-50 to 50)
  offsetY: number; // percentage of slot height (-50 to 50)
}

export type ImageTransformMap = Record<string, ImageTransform>;

export interface UseCardEditorOptions {
  initialHeadline?: string;
  initialBody?: string;
}

export function useCardEditor(
  template: CardTemplate,
  options: UseCardEditorOptions = {}
) {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );

  const [userContent, setUserContent] = useState<UserCardContent>(() =>
    createDefaultUserContent(options.initialHeadline ?? "Happy Father's Day!", undefined, options.initialBody)
  );

  const [imageTransforms, setImageTransforms] = useState<ImageTransformMap>(
    () => {
      const map: ImageTransformMap = {};
      template.elements
        .filter((el): el is ImageElement => el.type === "imageFrame")
        .forEach((el) => {
          map[el.id] = { scale: 1, offsetX: 0, offsetY: 0 };
        });
      return map;
    }
  );

  const updateUserContent = useCallback(
    (patch: Partial<UserCardContent>) => {
      setUserContent((prev) => ({ ...prev, ...patch }));
    },
    []
  );

  const updateImageTransform = useCallback(
    (elementId: string, patch: Partial<ImageTransform>) => {
      setImageTransforms((prev) => ({
        ...prev,
        [elementId]: { ...(prev[elementId] ?? { scale: 1, offsetX: 0, offsetY: 0 }), ...patch },
      }));
    },
    []
  );

  const setPhotoUrl = useCallback((url: string | null) => {
    updateUserContent({ photoUrl: url });
  }, [updateUserContent]);

  return {
    selectedElementId,
    setSelectedElementId,
    userContent,
    updateUserContent,
    imageTransforms,
    updateImageTransform,
    setPhotoUrl,
  };
}

