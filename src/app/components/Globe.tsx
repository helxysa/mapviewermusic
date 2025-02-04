"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
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
        title: "Ultima Vez",
        artist: "Aleem Neckklace",
        link: "https://open.spotify.com/intl-pt/track/7eRhMBRHhmRA7VvWLVIMyO?si=87f05a0893af4679",
      },
      {
        title: "a gente nunca conversou (moça)",
        artist: "lagum",
        link: "https://open.spotify.com/intl-pt/track/7eRhMBRHhmRA7VvWLVIMyO?si=87f05a0893af4679",
      },
      {
        title: "YSL",
        artist: "yunk vino",
        link: "https://open.spotify.com/intl-pt/track/4O3nF2ZJXQJv7l9yE7RgtL?si=043fb0412ab1427c",
      },
      {
        title: "FNB",
        artist: "japa, ryu, the runner",
        link: "https://open.spotify.com/intl-pt/track/5JX23868UTT3DBgj7i5yrK?si=5cd2337e6f9742cf",
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
      {
        title: "biking",
        artist: "frank ocean, jayz, tyler, the creator",
        link: "https://open.spotify.com/intl-pt/track/2q0VexHJirnUPnEOhr2DxK?si=47a6d6b591324bff",
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
  selectedLocation,
}: {
  onLocationSelect: (location: Location) => void;
  selectedLocation: Location | null;
}) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const [isMobile, setIsMobile] = useState(false);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);

  const [textures, setTextures] = useState<{
    earthTexture: THREE.Texture | null;
    cloudsTexture: THREE.Texture | null;
    starsTexture: THREE.Texture | null;
    markerTextures: THREE.Texture[];
  }>({
    earthTexture: null,
    cloudsTexture: null,
    starsTexture: null,
    markerTextures: [],
  });

  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();

    Promise.all([
      textureLoader.loadAsync("/earth_texture.jpg"),
      textureLoader.loadAsync("/clouds.jpg"),
      textureLoader.loadAsync("/stars.jpg"),
      ...locations.map((loc) => textureLoader.loadAsync(loc.iconUrl)),
    ]).then(([earth, clouds, stars, ...markers]) => {
      setTextures({
        earthTexture: earth,
        cloudsTexture: clouds,
        starsTexture: stars,
        markerTextures: markers,
      });
      setTexturesLoaded(true);
    });
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005;
    }

    const distance = camera.position.length();
    setShowMarkers(distance < 15);
  });

  if (!texturesLoaded) {
    return null;
  }

  return (
    <group>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        minDistance={isMobile ? 4 : 4}
        maxDistance={15}
        enablePan={false}
        enableDamping={true}
        dampingFactor={isMobile ? 0.05 : 0.05}
        rotateSpeed={isMobile ? 1 : 1}
      />

      <mesh>
        <sphereGeometry args={[50, 64, 64]} />
        <meshBasicMaterial map={textures.starsTexture} side={THREE.BackSide} />
      </mesh>

      <group>
        <Sphere
          ref={earthRef}
          args={[2, isMobile ? 32 : 64, isMobile ? 32 : 64]}
        >
          <meshPhongMaterial
            map={textures.earthTexture}
            specularMap={textures.earthTexture}
            specular={new THREE.Color(0x666666)}
            shininess={10}
            bumpMap={textures.earthTexture}
            bumpScale={0.1}
          />
        </Sphere>

        <Sphere
          ref={cloudsRef}
          args={[2.005, isMobile ? 32 : 64, isMobile ? 32 : 64]}
        >
          <meshPhongMaterial
            transparent
            opacity={0.2}
            color="#4099ff"
            blending={THREE.AdditiveBlending}
            side={THREE.FrontSide}
          />
        </Sphere>

        <Sphere
          ref={cloudsRef}
          args={[2.05, isMobile ? 32 : 64, isMobile ? 32 : 64]}
        >
          <meshPhongMaterial
            map={textures.cloudsTexture}
            transparent={true}
            opacity={0.4}
            depthWrite={false}
          />
        </Sphere>
      </group>

      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.7} />
      <directionalLight position={[5, 3, 5]} intensity={1} castShadow />
      <hemisphereLight args={["#ffffff", "#004080", 0.6]} />

      <group>
        {locations.map((location, index) => (
          <group
            key={location.id}
            position={latLngToVector3(location.lat, location.lng, 2.1)}
          >
            <Html
              position={[0, 0, 0]}
              center
              distanceFactor={isMobile ? 15 : 10}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                pointerEvents: selectedLocation ? "none" : "auto",
                opacity: selectedLocation || !showMarkers ? 0 : 1,
                transition: "opacity 0.3s ease",
                visibility: showMarkers ? "visible" : "hidden",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkerClick(location);
                }}
                style={{
                  background: "rgba(29, 185, 84, 0.9)",
                  border: "none",
                  borderRadius: "50%",
                  width: isMobile ? "25px" : "35px",
                  height: isMobile ? "25px" : "35px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: isMobile ? "8px" : "10px",
                  fontWeight: "bold",
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(29, 185, 84, 0.5)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  visibility:
                    selectedLocation || !showMarkers ? "hidden" : "visible",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 16px rgba(29, 185, 84, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(29, 185, 84, 0.5)";
                }}
              >
                <div
                  style={{
                    width: "0",
                    height: "0",
                    borderStyle: "solid",
                    borderWidth: "6px 0 6px 10px",
                    borderColor: "transparent transparent transparent #ffffff",
                    marginLeft: "2px",
                  }}
                />
              </button>
              <div
                style={{
                  background: "rgba(0,0,0,0.8)",
                  color: "white",
                  padding: isMobile ? "8px 12px" : "5px 10px",
                  borderRadius: "5px",
                  whiteSpace: "nowrap",
                  fontSize: isMobile ? "14px" : "12px",
                  backdropFilter: "blur(5px)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: "500",
                  visibility:
                    selectedLocation || !showMarkers ? "hidden" : "visible",
                }}
              >
                {location.name}
              </div>
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
    return [0, 0, isMobile ? 8 : 8];
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [showToast, setShowToast] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Camada 1: Canvas/Globo */}
      <div style={{ position: "absolute", width: "100%", height: "100%" }}>
        <Canvas
          camera={{ position: initialCameraPosition, fov: 45 }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={["#000"]} />
          <fog attach="fog" args={["#000", 20, 40]} />

          {/* Background Stars */}
          <mesh>
            <sphereGeometry args={[50, 64, 64]} />
            <meshBasicMaterial
              map={useLoader(THREE.TextureLoader, "/starts.jpg")}
              side={THREE.BackSide}
            />
          </mesh>

          <Earth
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
          />
        </Canvas>
      </div>

      {/* Camada 2: Modal */}
      {selectedLocation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            zIndex: 100000,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              padding: "25px",
              borderRadius: "15px",
              minWidth: "320px",
              maxWidth: "90vw",
              color: "white",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              position: "relative",
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
        </div>
      )}

      {/* Camada 3: Toast */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "15px 25px",
            borderRadius: "10px",
            zIndex: 10000,
            textAlign: "center",
            animation: "fadeOut 0.5s ease-in-out 4.5s forwards",
            fontSize:
              typeof window !== "undefined" && window.innerWidth < 768
                ? "14px"
                : "16px",
            maxWidth: "90vw",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          Só mover com o mouse ou o dedo o planeta, e clicar em cima do país
          para aproximar
        </div>
      )}
    </div>
  );
}
