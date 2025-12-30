import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Concept {
    id: string;
    name: string;
    mastery: number; // 0-100
    position: [number, number, number];
    subject: string;
    connections?: string[]; // IDs of connected concepts
}

// Color mapping for different subjects
const SUBJECT_COLORS: Record<string, string> = {
    math: '#3b82f6',      // Blue
    science: '#10b981',   // Green
    english: '#f59e0b',   // Amber
    history: '#8b5cf6',   // Purple
    physics: '#06b6d4',   // Cyan
    chemistry: '#14b8a6', // Teal
    default: '#ffffff'    // White
};

// Individual star component
function ConceptStar({ concept }: { concept: Concept }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    // Calculate star properties based on mastery
    const brightness = concept.mastery / 100;
    const size = 0.4 + (concept.mastery / 100) * 0.6; // 0.4 to 1.0 - more dramatic size difference
    const color = SUBJECT_COLORS[concept.subject.toLowerCase()] || SUBJECT_COLORS.default;

    // Pulsing animation for active learning (mastery between 20-80)
    useFrame((state) => {
        if (meshRef.current && concept.mastery > 20 && concept.mastery < 80) {
            const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
            meshRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group position={concept.position}>
            <mesh
                ref={meshRef}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={brightness * 2}
                    transparent
                    opacity={0.6 + brightness * 0.4}
                />
            </mesh>

            {/* Glow effect - reduced for clarity */}
            <mesh scale={hovered ? 1.8 : 1.2}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={brightness * 0.12}
                />
            </mesh>

            {/* Label on hover - improved visibility */}
            {hovered && (
                <Text
                    position={[0, size + 1.2, 0]}
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="bottom"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {concept.name}
                    {'\n'}
                    {concept.mastery}% Mastery
                </Text>
            )}
        </group>
    );
}

// Connection lines between related concepts
function ConstellationLines({ concepts }: { concepts: Concept[] }) {
    const lines = useMemo(() => {
        const result: JSX.Element[] = [];

        concepts.forEach((concept) => {
            concept.connections?.forEach((connectedId) => {
                const connected = concepts.find(c => c.id === connectedId);
                if (connected) {
                    const points = [
                        new THREE.Vector3(...concept.position),
                        new THREE.Vector3(...connected.position)
                    ];
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);

                    result.push(
                        <line key={`${concept.id}-${connectedId}`} geometry={geometry}>
                            <lineBasicMaterial
                                color="#6366f1"
                                transparent
                                opacity={0.3}
                                linewidth={1}
                            />
                        </line>
                    );
                }
            });
        });

        return result;
    }, [concepts]);

    return <>{lines}</>;
}

// Particle effects for learning activity
function LearningParticles() {
    const particlesRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const count = 1000;
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#6366f1"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

// Main Neural Galaxy component
export default function NeuralGalaxy() {
    const [concepts, setConcepts] = useState<Concept[]>([]);

    useEffect(() => {
        // Mock data with improved 3D positioning for better depth
        const mockConcepts: Concept[] = [
            // Math cluster (Blue) - Top right with depth variation
            {
                id: '1',
                name: 'Quadratic Equations',
                mastery: 85,
                position: [4, 2, -3],
                subject: 'math',
                connections: ['2', '3']
            },
            {
                id: '2',
                name: 'Linear Algebra',
                mastery: 65,
                position: [3, 3, -1],
                subject: 'math',
                connections: ['1']
            },
            {
                id: '3',
                name: 'Calculus Basics',
                mastery: 45,
                position: [5, 1, -4],
                subject: 'math',
                connections: ['1', '4']
            },
            {
                id: '4',
                name: 'Derivatives',
                mastery: 30,
                position: [6, 0, -2],
                subject: 'math',
                connections: ['3']
            },
            // Physics cluster (Cyan) - Left side with depth
            {
                id: '5',
                name: 'Newton\'s Laws',
                mastery: 90,
                position: [-4, 2, 3],
                subject: 'physics',
                connections: ['6']
            },
            {
                id: '6',
                name: 'Kinematics',
                mastery: 75,
                position: [-5, 0, 4],
                subject: 'physics',
                connections: ['5']
            },
            // Chemistry cluster (Teal) - Bottom with forward depth
            {
                id: '7',
                name: 'Chemical Bonds',
                mastery: 55,
                position: [1, -3, 5],
                subject: 'chemistry',
                connections: ['8']
            },
            {
                id: '8',
                name: 'Periodic Table',
                mastery: 95,
                position: [0, -4, 3],
                subject: 'chemistry',
                connections: ['7']
            },
        ];

        setConcepts(mockConcepts);
    }, []);

    return (
        <div className="w-full h-full bg-gradient-to-b from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl overflow-hidden">
            <Canvas
                camera={{ position: [0, 0, 15], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />

                {/* Background stars */}
                <Stars
                    radius={100}
                    depth={50}
                    count={5000}
                    factor={4}
                    saturation={0}
                    fade
                    speed={0.5}
                />

                {/* Learning particles */}
                <LearningParticles />

                {/* Constellation lines */}
                <ConstellationLines concepts={concepts} />

                {/* Concept stars */}
                {concepts.map((concept) => (
                    <ConceptStar key={concept.id} concept={concept} />
                ))}

                {/* Camera controls */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={true}
                    enableRotate={true}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    minDistance={5}
                    maxDistance={30}
                />
            </Canvas>

            {/* Legend - moved to bottom-left */}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white text-xs">
                <div className="font-bold mb-2">Legend</div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Math</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                        <span>Physics</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <span>Chemistry</span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="text-[10px] opacity-75">
                        Brightness = Mastery Level
                    </div>
                    <div className="text-[10px] opacity-75">
                        Size = Concept Importance
                    </div>
                </div>
            </div>

            {/* Stats overlay - moved to bottom-right */}
            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md rounded-lg p-4 text-white">
                <div className="text-2xl font-bold">{concepts.length}</div>
                <div className="text-xs opacity-75">Concepts Learned</div>
                <div className="mt-2 text-lg font-bold text-emerald-400">
                    {Math.round(concepts.reduce((sum, c) => sum + c.mastery, 0) / concepts.length)}%
                </div>
                <div className="text-xs opacity-75">Avg Mastery</div>
            </div>
        </div>
    );
}
