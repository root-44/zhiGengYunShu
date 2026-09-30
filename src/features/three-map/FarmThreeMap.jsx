import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export default function FarmThreeMap({ role, assets = [], ownedAssetIds = [], onSelectAsset }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6fbf8);
    const camera = new THREE.PerspectiveCamera(42, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 100);
    camera.position.set(4.8, 5.2, 6.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.setAttribute("aria-label", role === "admin" ? "农场管理员全亮3D农场地图" : "农户局部高亮3D农场地图");
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(4, 7, 5);
    scene.add(ambient, keyLight);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.08, 4.6),
      new THREE.MeshStandardMaterial({ color: 0xdff2e7, roughness: 0.84 })
    );
    ground.position.y = -0.08;
    scene.add(ground);

    const mapAssets = Array.isArray(assets) ? assets : [];
    const clickableMeshes = [];
    mapAssets.forEach((asset) => {
      const isLit = role === "admin" || ownedAssetIds.includes(asset.id);
      const geometry = asset.type === "greenhouse"
        ? new THREE.BoxGeometry(1.12, 0.45, 0.74)
        : new THREE.BoxGeometry(1.3, 0.16, 0.88);
      const material = new THREE.MeshStandardMaterial({
        color: isLit ? (asset.type === "greenhouse" ? 0x45d37f : 0x36afd5) : 0x9eb2aa,
        emissive: isLit ? 0x164c2a : 0x000000,
        emissiveIntensity: isLit ? 0.24 : 0,
        transparent: true,
        opacity: isLit ? 0.96 : 0.34,
        roughness: 0.56
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(asset.x, asset.type === "greenhouse" ? 0.28 : 0.05, asset.z);
      mesh.userData.assetId = asset.id;
      mesh.userData.asset = asset;
      scene.add(mesh);
      clickableMeshes.push(mesh);
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    function handlePointerDown(event) {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickableMeshes)[0];
      if (hit?.object.userData.assetId) {
        onSelectAsset?.(hit.object.userData.asset);
      }
    }

    function handleResize() {
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }

    renderer.domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);
    renderer.render(scene, camera);

    return () => {
      renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mount.replaceChildren();
    };
  }, [role, assets, ownedAssetIds, onSelectAsset]);

  return (
    <div className={`farm-three-map ${role === "admin" ? "map-mode-full" : "map-mode-owned"}`} ref={mountRef}>
      <span>3D农场地图加载中</span>
    </div>
  );
}
