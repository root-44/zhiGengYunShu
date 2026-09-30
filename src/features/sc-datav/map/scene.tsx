import { Suspense } from "react";
import Cloud from "./cloud";
import Base from "./base";
import Bottom from "./bottom";
import type { CityGeoJSON } from "@/types/map";
import type { FarmOverview } from "../api";

import scMapData from "@/assets/sc.json";
import scOutlineData from "@/assets/sc_outline.json";

const mapData = scMapData as CityGeoJSON,
  outlineData = scOutlineData as CityGeoJSON;

interface SceneProps {
  overview: FarmOverview;
  hoveredAssetId: string;
  selectedAssetId: string;
  onHoverAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

export default function Scene({
  overview,
  hoveredAssetId,
  selectedAssetId,
  onHoverAsset,
  onSelectAsset,
}: SceneProps) {
  return (
    <Suspense fallback={null}>
      <Cloud />

      <Base
        data={mapData}
        outlineData={outlineData}
        overview={overview}
        hoveredAssetId={hoveredAssetId}
        selectedAssetId={selectedAssetId}
        onHoverAsset={onHoverAsset}
        onSelectAsset={onSelectAsset}
      />

      <Bottom />
    </Suspense>
  );
}
