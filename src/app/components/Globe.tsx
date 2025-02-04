"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
}

const locations: Location[] = [
  { id: 1, name: "brasil", lat: -23.5505, lng: -46.6333, color: "#ff0000" },
  { id: 2, name: "eua", lat: 40.7128, lng: -74.006, color: "#00ff00" },
  { id: 3, name: "coreia", lat: 35.1796, lng: 129.0756, color: "#0000ff" },
];

function latLngToVector3(
  lat: number,
  lng: number,
  radius: number
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const [earthTexture, cloudsTexture] = useLoader(THREE.TextureLoader, [
    "/earth_texture.jpg",
    "/clouds.jpg",
  ]);

  const handleMarkerClick = (lat: number, lng: number) => {
    const distance = 4;
    const targetPosition = latLngToVector3(lat, lng, distance);

    gsap.to(camera.position, {
      x: targetPosition.x,
      y: targetPosition.y,
      z: targetPosition.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(0, 0, 0);
        if (controlsRef.current) {
          controlsRef.current.update();
        }
      },
    });
  };

  return (
    <group>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minDistance={isMobile ? 6 : 4}
        maxDistance={15}
        enablePan={false}
        enableDamping={true}
        dampingFactor={0.05}
        rotateSpeed={isMobile ? 0.5 : 1}
        touchAction="none"
      />

      <group>
        <Sphere
          ref={earthRef}
          args={[2, isMobile ? 32 : 64, isMobile ? 32 : 64]}
        >
          <meshPhongMaterial
            map={earthTexture}
            specular={new THREE.Color("grey")}
            shininess={5}
          />
        </Sphere>

        <Sphere
          ref={cloudsRef}
          args={[2.05, isMobile ? 32 : 64, isMobile ? 32 : 64]}
        >
          <meshPhongMaterial
            map={cloudsTexture}
            transparent={true}
            opacity={0.4}
          />
        </Sphere>
      </group>

      <group>
        {locations.map((location) => (
          <group
            key={location.id}
            position={latLngToVector3(location.lat, location.lng, 2.1)}
          >
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(location.lat, location.lng);
              }}
            >
              <sphereGeometry args={[isMobile ? 0.15 : 0.1, 16, 16]} />
              <meshBasicMaterial color={location.color} />
            </mesh>
            <Html
              position={[0, 0.3, 0]}
              center
              distanceFactor={isMobile ? 15 : 10}
              style={{
                background: "rgba(0,0,0,0.8)",
                color: "white",
                padding: isMobile ? "8px 12px" : "5px 10px",
                borderRadius: "5px",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                fontSize: isMobile ? "14px" : "12px",
              }}
            >
              {location.name}
            </Html>
          </group>
        ))}
      </group>
    </group>
  );
}

export default function Globe() {
  const [initialCameraPosition] = useState<[number, number, number]>(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    return [0, 0, isMobile ? 12 : 8];
  });

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: "#000000",
        touchAction: "none",
      }}
    >
      <Canvas camera={{ position: initialCameraPosition, fov: 45 }}>
        <color attach="background" args={["#000"]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <Earth />
      </Canvas>
    </div>
  );
}
