import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import styled from "styled-components";
import { Color, Group, Mesh, Vector3 } from "three";
import { displayStatus, type FarmAssetOverview, type FarmOverview } from "./api";
import Cloud from "./map/cloud";
import Bottom from "./map/bottom";

const Label = styled.div<{ $active?: boolean; $tone?: string }>`
  min-width: 120px;
  padding: 8px 10px;
  border: 1px solid rgba(234, 88, 12, 0.5);
  border-radius: 4px;
  color: #50382a;
  background: rgba(255, 245, 232, 0.82);
  box-shadow: 0 10px 30px rgba(234, 88, 12, 0.16);
  transform: translate(-50%, -100%);
  pointer-events: none;
  opacity: ${(props) => (props.$active ? 1 : 0.78)};

  strong {
    display: block;
    font-size: 13px;
    color: ${(props) => (props.$tone === "warning" ? "#c2410c" : "#245236")};
    white-space: nowrap;
  }

  span {
    display: block;
    margin-top: 2px;
    font-size: 11px;
    color: rgba(80, 56, 42, 0.78);
    white-space: nowrap;
  }
`;

interface FarmSceneProps {
  overview: FarmOverview;
  hoveredAssetId: string;
  selectedAssetId: string;
  onHoverAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
}

function assetTone(asset: FarmAssetOverview) {
  if (asset.status === "warning" || asset.openAlertCount > 0) return "warning";
  if (asset.status === "offline") return "offline";
  return "active";
}

function toneColor(tone: string) {
  if (tone === "warning") return "#f97316";
  if (tone === "offline") return "#7f8b8d";
  return "#55b66d";
}

function Greenhouse({
  asset,
  active,
  onHoverAsset,
  onSelectAsset,
}: {
  asset: FarmAssetOverview;
  active: boolean;
  onHoverAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const tone = assetTone(asset);
  const color = toneColor(tone);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = 0.12 + Math.sin(clock.elapsedTime * 1.4 + asset.position.x) * (active ? 0.05 : 0.02);
    }
  });

  return (
    <group
      position={[asset.position.x, 0, asset.position.z]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHoverAsset(asset.id);
      }}
      onPointerOut={() => onHoverAsset("")}
      onClick={(event) => {
        event.stopPropagation();
        onSelectAsset(asset.id);
      }}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[asset.size.width + 2, asset.size.length + 2]} />
        <meshStandardMaterial color="#d8f1cd" roughness={0.82} />
      </mesh>
      <mesh ref={meshRef} castShadow receiveShadow position={[0, asset.size.height / 2, 0]}>
        <boxGeometry args={[asset.size.width, asset.size.height, asset.size.length]} />
        <meshPhysicalMaterial
          color="#f7fff5"
          transparent
          opacity={0.48}
          roughness={0.18}
          metalness={0.05}
          transmission={0.25}
        />
      </mesh>
      <mesh castShadow position={[0, asset.size.height + 0.08, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[asset.size.width * 0.8, 0.18, asset.size.length]} />
        <meshStandardMaterial color={color} emissive={new Color(color)} emissiveIntensity={active ? 0.42 : 0.18} />
      </mesh>
      <Html position={[0, asset.size.height + 2.6, 0]} center>
        <Label $active={active} $tone={tone}>
          <strong>{asset.name}</strong>
          <span>{asset.crop} / {asset.growthStage}</span>
        </Label>
      </Html>
    </group>
  );
}

function Plot({
  asset,
  active,
  onHoverAsset,
  onSelectAsset,
}: {
  asset: FarmAssetOverview;
  active: boolean;
  onHoverAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
}) {
  const groupRef = useRef<Group>(null);
  const tone = assetTone(asset);
  const color = toneColor(tone);
  const ridges = useMemo(() => Array.from({ length: 5 }, (_, index) => index - 2), []);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime + asset.position.z) * (active ? 0.03 : 0.01);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[asset.position.x, 0, asset.position.z]}
      onPointerOver={(event) => {
        event.stopPropagation();
        onHoverAsset(asset.id);
      }}
      onPointerOut={() => onHoverAsset("")}
      onClick={(event) => {
        event.stopPropagation();
        onSelectAsset(asset.id);
      }}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[asset.size.width, asset.size.length]} />
        <meshStandardMaterial color={active ? "#b9e89d" : "#a7d887"} roughness={0.9} />
      </mesh>
      {ridges.map((offset) => (
        <mesh key={offset} castShadow position={[offset * (asset.size.width / 6), 0.16, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.55, 0.32, asset.size.length * 0.88]} />
          <meshStandardMaterial color={color} emissive={new Color(color)} emissiveIntensity={active ? 0.3 : 0.12} />
        </mesh>
      ))}
      <Html position={[0, 4.2, 0]} center>
        <Label $active={active} $tone={tone}>
          <strong>{asset.name}</strong>
          <span>{asset.crop} / {asset.growthStage}</span>
        </Label>
      </Html>
    </group>
  );
}

function FarmBase({ assets }: { assets: FarmAssetOverview[] }) {
  const points = assets.map((asset) => new Vector3(asset.position.x, 0, asset.position.z));
  const minX = Math.min(...points.map((point) => point.x), -36) - 16;
  const maxX = Math.max(...points.map((point) => point.x), 36) + 16;
  const minZ = Math.min(...points.map((point) => point.z), -28) - 14;
  const maxZ = Math.max(...points.map((point) => point.z), 28) + 14;

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[(minX + maxX) / 2, -0.08, (minZ + maxZ) / 2]}>
        <planeGeometry args={[maxX - minX, maxZ - minZ]} />
        <meshStandardMaterial color="#eef8dc" roughness={0.92} />
      </mesh>
      <gridHelper args={[Math.max(maxX - minX, maxZ - minZ), 24, "#f97316", "#a7c777"]} position={[0, 0.02, 0]} />
    </group>
  );
}

export default function FarmScene({
  overview,
  hoveredAssetId,
  selectedAssetId,
  onHoverAsset,
  onSelectAsset,
}: FarmSceneProps) {
  const activeId = hoveredAssetId || selectedAssetId;
  const assets = overview.assets;

  return (
    <>
      <Bottom />
      <Cloud />
      <FarmBase assets={assets} />
      {assets.map((asset) => {
        const active = activeId === asset.id;
        return asset.type === "plot" ? (
          <Plot
            key={asset.id}
            asset={asset}
            active={active}
            onHoverAsset={onHoverAsset}
            onSelectAsset={onSelectAsset}
          />
        ) : (
          <Greenhouse
            key={asset.id}
            asset={asset}
            active={active}
            onHoverAsset={onHoverAsset}
            onSelectAsset={onSelectAsset}
          />
        );
      })}
      <Html position={[0, 8, -34]} center>
        <Label $active>
          <strong>{overview.farmName}</strong>
          <span>{overview.summary.greenhouseCount} 个大棚 / {overview.summary.plotCount} 个地块 / {displayStatus("active")}</span>
        </Label>
      </Html>
    </>
  );
}
