import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    Stars,
    Sparkles,
    Float,
    Cone,
    Cylinder,
    Sphere,
    Box
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- COMPONENTS ---

const Rocket = () => {
    const group = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (group.current) {
            // Gentle vibration/wobble of flight
            group.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 5) * 0.02;
            group.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
        }
    });

    return (
        <group ref={group} scale={0.8}>
            {/* Main Body */}
            <Cylinder args={[0.6, 0.8, 4, 32]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#eeeeee" metalness={0.5} roughness={0.2} />
            </Cylinder>

            {/* Nose Cone */}
            <Cone args={[0.6, 1.5, 32]} position={[0, 2.75, 0]}>
                <meshStandardMaterial color="#ef4444" roughness={0.2} />
            </Cone>

            {/* Window */}
            <mesh position={[0, 1, 0.55]}>
                <sphereGeometry args={[0.3, 32, 16]} />
                <meshPhysicalMaterial
                    color="#60a5fa"
                    emissive="#3b82f6"
                    emissiveIntensity={0.5}
                    roughness={0}
                    transmission={0.5}
                    thickness={0.5}
                />
            </mesh>
            <mesh position={[0, 1, 0.55]}>
                <ringGeometry args={[0.3, 0.35, 32]} />
                <meshStandardMaterial color="#94a3b8" />
            </mesh>

            {/* Fins */}
            {[0, 1, 2, 3].map((i) => (
                <group key={i} rotation={[0, (Math.PI / 2) * i, 0]}>
                    <Box args={[0.1, 1.5, 1]} position={[0.6, -1.2, 0]}>
                        <meshStandardMaterial color="#ef4444" />
                    </Box>
                </group>
            ))}

            {/* Engine Nozzles */}
            <group position={[0, -2.2, 0]}>
                <Cylinder args={[0.3, 0.5, 0.5, 16]}>
                    <meshStandardMaterial color="#334155" />
                </Cylinder>
                {/* Flame */}
                <group position={[0, -0.8, 0]} rotation={[Math.PI, 0, 0]}>
                    <Cone args={[0.4, 1.5, 16]}>
                        <meshBasicMaterial color="#fbbf24" opacity={0.8} transparent />
                    </Cone>
                    <Cone args={[0.2, 1, 16]} position={[0, -0.2, 0]}>
                        <meshBasicMaterial color="#ffffff" opacity={0.9} transparent />
                    </Cone>
                </group>
            </group>
        </group>
    );
};

const Planet = () => {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <Sphere args={[6, 64, 64]} ref={mesh} position={[10, -5, -10]}>
            <meshStandardMaterial
                color="#4f46e5"
                roughness={0.7}
                displacementScale={0.2}
            />
        </Sphere>
    );
}

const Moon = () => {
    return (
        <Sphere args={[1, 32, 32]} position={[-6, 4, -4]}>
            <meshStandardMaterial color="#d1d5db" roughness={0.8} />
        </Sphere>
    )
}

const SpaceDust = () => {
    const ref = useRef<any>(null);
    useFrame(() => {
        if (ref.current) {
            // Simulate speed by moving stars down
            // ref.current.position.y -= 0.05; 
            // Reset logic omitted for simplicity, instead we move the texture or camera
        }
    });

    return (
        <Sparkles
            count={500}
            scale={12}
            size={3}
            speed={2} // Fast speed for "warp" effect
            opacity={0.8}
            color="#ffffff"
        />
    );
};

// --- SCENE ---

const Scene = () => {
    return (
        <>
            <ambientLight intensity={0.2} />
            <pointLight position={[5, 10, 5]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-5, -5, -5]} intensity={0.5} color="#blue" />

            {/* Primary Hero: The Rocket */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                <Rocket />
            </Float>

            {/* Background elements */}
            <Planet />
            <Moon />
            <SpaceDust />

            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={2} />

            <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={0.8} intensity={1} radius={0.5} />
                <Vignette eskil={false} offset={0.1} darkness={0.4} />
            </EffectComposer>
        </>
    );
};

// --- EXPORT ---

export const ExpertHero3D = () => {
    return (
        <div className="w-full h-[700px] relative">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 45 }}
                gl={{ antialias: false }}
            >
                <color attach="background" args={['#0f172a']} /> {/* Dark Blue Space BG */}
                <Scene />
                <OrbitControls
                    enableZoom={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>

            {/* Overlay Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 via-transparent to-transparent pointer-events-none" />
        </div>
    );
};

export default ExpertHero3D;
