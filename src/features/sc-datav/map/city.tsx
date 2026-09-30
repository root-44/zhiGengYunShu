import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DoubleSide,
  Shape,
  ShapeGeometry,
  Vector3,
  type Box2,
  type Group,
  type MeshStandardMaterialProperties,
  type Vector2,
} from "three";
import ShapeMesh from "./shape";
import Tooltip from "./tooltip";
import Bar from "./bar";
import Label from "./label";
import type { FarmAssetOverview } from "../api";
import type { FarmMapRegion } from "../farmMapAdapter";

export interface CityProps
  extends Pick<MeshStandardMaterialProperties, "map" | "normalMap"> {
  bbox: Box2;
  depth: number;
  hoveredAssetId: string;
  selectedAssetId: string;
  onHoverAsset: (assetId: string) => void;
  onSelectAsset: (assetId: string) => void;
  data: {
    geoRegionName: string;
    assetId: string;
    label: string;
    value: number;
    asset: FarmAssetOverview;
    farmRegion: FarmMapRegion;
    center: [x: number, y: number, z: number];
    points: Vector2[][];
  };
}

export default function City(props: CityProps) {
  const {
    data,
    bbox,
    depth,
    hoveredAssetId,
    selectedAssetId,
    onHoverAsset,
    onSelectAsset,
    map,
    normalMap,
  } = props;
  const groupRef = useRef<Group>(null!);
  const tooltipRef = useRef<{ open: () => void; close: () => void }>(null!);
  const vector3 = useRef(new Vector3(1, 1, 1));
  const interactive = data.farmRegion.interactive;
  const active = interactive && (data.assetId === hoveredAssetId || data.assetId === selectedAssetId);

  const [shape, shapeGeometry] = useMemo(() => {
    const shapes = data.points.map((e) => new Shape(e));
    const shapeGeometry = new ShapeGeometry(shapes);
    return [shapes, shapeGeometry];
  }, [data.points]);

  useFrame(() => {
    groupRef.current.scale.lerp(vector3.current, 0.1);
  });

  useEffect(() => {
    vector3.current.setZ(active ? 1.5 : 1);
  }, [active]);

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        vector3.current.setZ(1.5);
        onHoverAsset(data.assetId);
        tooltipRef.current.open();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        if (!interactive) return;
        vector3.current.setZ(data.assetId === selectedAssetId ? 1.5 : 1);
        onHoverAsset("");
        tooltipRef.current.close();
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        onSelectAsset(data.assetId);
      }}>
      <ShapeMesh position-z={depth + 0.1} bbox={bbox} args={[shape]}>
        <meshStandardMaterial map={map} normalMap={normalMap} />
      </ShapeMesh>
      <mesh castShadow receiveShadow>
        <extrudeGeometry
          args={[shape, { depth, steps: 1, bevelEnabled: false }]}
        />
        <meshStandardMaterial
          transparent
          opacity={0}
          metalness={0.2}
          roughness={0.5}
          side={DoubleSide}
          color="#f9f3e7"
        />
      </mesh>
      <lineSegments position-z={depth + 0.2} raycast={() => null}>
        <edgesGeometry args={[shapeGeometry]} />
        <lineBasicMaterial transparent opacity={0} color="#ffffff" />
      </lineSegments>

      {interactive && (
        <Bar position={data.center} value={data.value} factor={3.2} maxHeight={12}>
          {(barHeight) => (
            <>
              <Label
                center
                position={[0, 0, barHeight + 0.8]}
                distanceFactor={100}
                zIndexRange={[100 - 1000]}>
                {data.label}
              </Label>
              <Tooltip
                ref={tooltipRef}
                data={data.farmRegion}
                position={[0, 0, barHeight + 5]}
                visible={false}
              />
            </>
          )}
        </Bar>
      )}
    </group>
  );
}
