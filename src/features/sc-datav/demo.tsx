import { useEffect, useState } from "react";
import styled from "styled-components";
import { useConfigStore } from "./stores";
import Panel from "./panel";
import Map from "./map";
import {
  fallbackFarmerFarmOverview,
  fallbackFarmOverview,
  loadAdminFarmOverview,
  loadFarmerFarmOverview,
  type FarmAssetOverview,
  type FarmOverview,
} from "./api";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

interface IndexProps {
  scope?: "admin" | "farmer";
}

export default function Index({ scope = "admin" }: IndexProps) {
  const fallbackOverview = scope === "farmer" ? fallbackFarmerFarmOverview : fallbackFarmOverview;
  const [overview, setOverview] = useState<FarmOverview>(fallbackOverview);
  const [hoveredAssetId, setHoveredAssetId] = useState<string>("");
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    return useConfigStore.getState().reset();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const data = scope === "farmer" ? await loadFarmerFarmOverview() : await loadAdminFarmOverview();
        if (!cancelled) setOverview(data.assets.length ? data : fallbackOverview);
      } catch (error) {
        if (!cancelled) {
          setOverview(fallbackOverview);
          setLoadError(error instanceof Error ? error.message : "farm-overview load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [fallbackOverview, scope]);

  const hoveredAsset = overview.assets.find((asset) => asset.id === hoveredAssetId) || null;
  const selectedAsset = overview.assets.find((asset) => asset.id === selectedAssetId) || null;
  const activeAsset: FarmAssetOverview | null = hoveredAsset || selectedAsset;

  return (
    <Wrapper>
      <Map
        overview={overview}
        hoveredAssetId={hoveredAssetId}
        selectedAssetId={selectedAssetId}
        onHoverAsset={setHoveredAssetId}
        onSelectAsset={setSelectedAssetId}
      />
      <Panel
        overview={overview}
        activeAsset={activeAsset}
        loading={loading}
        loadError={loadError}
      />
    </Wrapper>
  );
}
