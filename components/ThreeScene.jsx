"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

// Floating translucent glass cards, ported from the Stitch "Interactive Home"
// Three.js scene. Fifteen panels drift, spin slowly, and lean toward the
// pointer while the camera does a gentle parallax. Violet and teal point
// lights catch the glass.
function GlassCards({ pointer, isLight }) {
  const group = useRef();

  const cards = useMemo(
    () =>
      Array.from({ length: 18 }, () => {
        // Spread wide across the screen and keep each card anchored to its
        // own base position so they never clump toward the center.
        const base = [
          (Math.random() - 0.5) * 38,
          (Math.random() - 0.5) * 24,
          (Math.random() - 0.5) * 10 - 4,
        ];
        return {
          base,
          rotation: [
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI,
          ],
          floatSpeed: Math.random() * 0.5 + 0.25,
          floatAmount: Math.random() * 0.6 + 0.3,
          phase: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
          // deeper cards parallax less, for a layered feel
          parallax: 0.4 + (base[2] + 9) * 0.06,
        };
      }),
    []
  );

  const refs = useRef([]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const c = cards[i];
      mesh.rotation.x += c.rotationSpeed;
      mesh.rotation.y += c.rotationSpeed;
      const floatY = Math.sin(t * c.floatSpeed + c.phase) * c.floatAmount;
      // anchored position + gentle float + subtle pointer parallax
      mesh.position.x = c.base[0] + pointer.current.x * c.parallax;
      mesh.position.y = c.base[1] + floatY - pointer.current.y * c.parallax;
    });
  });

  return (
    <group ref={group}>
      {cards.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={c.base}
          rotation={c.rotation}
        >
          <boxGeometry args={[2, 3, 0.05]} />
          <meshPhysicalMaterial
            color={isLight ? "#6d3bd7" : "#ffffff"}
            metalness={0}
            roughness={0.1}
            transmission={isLight ? 0.6 : 0.95}
            thickness={0.5}
            transparent
            opacity={isLight ? 0.4 : 0.2}
            reflectivity={0.5}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Rig({ pointer }) {
  useFrame((state) => {
    state.camera.position.x +=
      (pointer.current.x * 2 - state.camera.position.x) * 0.05;
    state.camera.position.y +=
      (-pointer.current.y * 2 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function ThreeScene() {
  const pointer = useRef({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState(false);

  // The canvas sits behind the UI with pointer-events disabled, so track the
  // cursor on the window instead.
  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Watch the theme by observing the `light` class on <html>, so the glass
  // tint stays visible in both light and dark modes.
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsLight(root.classList.contains("light"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight color={0x404040} intensity={2} />
      <pointLight color="#d0bcff" intensity={15} distance={100} position={[10, 10, 10]} />
      <pointLight color="#44e2cd" intensity={10} distance={100} position={[-10, -10, 10]} />
      <GlassCards pointer={pointer} isLight={isLight} />
      <Rig pointer={pointer} />
    </Canvas>
  );
}
