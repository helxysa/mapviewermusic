"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Html } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import styles from "./Globe.module.css";

interface Song {
  title: string;
  artist: string;
  link: string;
}

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  iconUrl: string;
  songs: Song[];
}

const locations: Location[] = [
  {
    id: 1,
    name: "brasil",
    lat: -23.5505,
    lng: -46.6333,
    iconUrl: "/icon.png",
    songs: [
      {
        title: "tudo",
        artist: "liniker",
        link: "https://open.spotify.com/intl-pt/track/6iBMj762l27f5fH6E1PUHE?si=8c00fbf420914402",
      },
      {
        title: "a gente nunca conversou (moça)",
        artist: "lagum",
        link: "https://open.spotify.com/intl-pt/track/7eRhMBRHhmRA7VvWLVIMyO?si=87f05a0893af4679",
      },
      {
        title: "a gente nunca conversou (moça)",
        artist: "lagum",
        link: "https://open.spotify.com/intl-pt/track/7eRhMBRHhmRA7VvWLVIMyO?si=87f05a0893af4679",
      },
    ],
  },
  {
    id: 2,
    name: "eua",
    lat: 40.7128,
    lng: -74.006,
    iconUrl: "/icon.png",
    songs: [
      {
        title: "Mr.Sun (miss da sun)",
        artist: "greentea peng",
        link: "https://open.spotify.com/intl-pt/track/2NHVRc2gml9maFMHRgIC0y?si=00e4a21d9014492a",
      },
      {
        title: "Is It A Crime?",
        artist: "No Guidnce",
        link: "https://open.spotify.com/intl-pt/track/2Cg9T9AvAQH25jGgydexrk?si=8207cdba2b764498",
      },
      {
        title: "Toroka",
        artist: "Christian Kuria",
        link: "https://open.spotify.com/intl-pt/track/6RMltEudPPFoJuUoshxRBB?si=e6f8f7148ccf479f",
      },
     {
        title: "Come Through and Chill",
        artist: "Miguel, J.Cole, Salaam Remi",
        link: "https://open.spotify.com/intl-pt/track/1m8WpLYXEiNVZchsWEcCSy?si=1fe729bc3fc84f1c",
      },
    ],
  },

  {
    id: 3,
    name: "coreia",
    lat: 35.1796,
    lng: 129.0756,
    iconUrl: "/icon.png",
    songs: [
      {
        title: "pick up your phone",
        artist: "hojean",
        link: "https://open.spotify.com/intl-pt/track/51x3Z7MeLg1fuQA7zfWehf?si=f62a1070e9b94a31",
      },
      {
        title: "nao consigo colocar o titulo, mas eh mt boa a musica",
        artist: "dean, SULLI, Rad Museum",
        link: "https://open.spotify.com/intl-pt/track/2AA1f7utyvXpmtKsEvp5lz?si=9293a11f8d214db0",
      },
      {
        title: "take me",
        artist: "miso",
        link: "https://open.spotify.com/intl-pt/track/7tIJDktakabGoHjwTTa35W?si=0c1b9842f4fc417c",
      },
      {
        title: "love",
        artist: "dean, syd",
        link: "https://open.spotify.com/intl-pt/track/6wcRv0UBvEH9NCIA3IVyQs?si=106a1715b5b24b1f",
      },
      
    ],
  },
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

function Earth({
  onLocationSelect,
}: {
  onLocationSelect: (location: Location) => void;
}) {
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

  const markerTextures = useLoader(
    THREE.TextureLoader,
    locations.map((loc) => loc.iconUrl)
  );

  const handleMarkerClick = (location: Location) => {
    const distance = 4;
    const targetPosition = latLngToVector3(
      location.lat,
      location.lng,
      distance
    );

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
      onComplete: () => {
        onLocationSelect(location);
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
        dampingFactor={isMobile ? 0.02 : 0.05}
        rotateSpeed={isMobile ? 2.1 : 1}
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
        {locations.map((location, index) => (
          <group
            key={location.id}
            position={latLngToVector3(location.lat, location.lng, 2.1)}
          >
            <sprite
              onClick={(e) => {
                e.stopPropagation();
                handleMarkerClick(location);
              }}
              scale={isMobile ? 0.5 : 0.3}
            >
              <spriteMaterial
                map={markerTextures[index]}
                transparent={true}
                sizeAttenuation={true}
                color="#ffffff"
              />
            </sprite>
            <Html
              position={[0, 0.2, 0]}
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

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  return (
    <>
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
          <Earth onLocationSelect={handleLocationSelect} />
        </Canvas>
      </div>
      {selectedLocation && (
        <div
          style={{
            position: "fixed",
            top: "60%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            padding: "25px",
            borderRadius: "15px",
            zIndex: 1000,
            minWidth: "320px",
            maxWidth: "90vw",
            color: "white",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "10px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
              {selectedLocation.name === "brasil"
                ? `musiquitas do ${selectedLocation.name}`
                : `musiquicas de ${selectedLocation.name}`}
            </h2>
            <button
              onClick={() => setSelectedLocation(null)}
              className={styles.closeButton}
            >
              ×
            </button>
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {selectedLocation.songs.map((song, index) => (
              <div key={index} className={styles.songItem}>
                <div style={{ marginBottom: "10px", fontSize: "1.1rem" }}>
                  {song.title} - {song.artist}
                </div>
                <a
                  href={song.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotifyLink}
                >
                  Ouvir no Spotify
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
