import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Stars, Sparkles } from '@react-three/drei';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface NodeProps {
    position: [number, number, number];
    color: string;
    label: string;
    size?: number;
    onClick?: () => void;
}

const GlowingNode = ({ position, color, label, size = 1, onClick }: NodeProps) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 0.01;
            meshRef.current.rotation.y += 0.01;
        }
    });

    return (
        <group position={position}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh
                    ref={meshRef}
                    onClick={onClick}
                    onPointerOver={() => setHover(true)}
                    onPointerOut={() => setHover(false)}
                    scale={hovered ? 1.2 : 1}
                >
                    <icosahedronGeometry args={[size, 1]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={hovered ? 2 : 0.5}
                        wireframe
                    />
                </mesh>
                <mesh scale={hovered ? 1.4 : 1.1}>
                    <sphereGeometry args={[size, 16, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.1} />
                </mesh>

                {hovered && (
                    <Text
                        position={[0, size + 0.5, 0]}
                        fontSize={0.5}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {label}
                    </Text>
                )}
            </Float>
        </group>
    );
};

const ConnectionLine = ({ start, end, color }: { start: [number, number, number], end: [number, number, number], color: string }) => {
    const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

    return (
        <line>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
                />
            </bufferGeometry>
            <lineBasicMaterial color={color} transparent opacity={0.2} />
        </line>
    );
};

const KnowledgeConstellation = () => {


    const subjects = [
        { id: 'math', position: [-4, 2, 0] as [number, number, number], color: '#3b82f6', label: 'Mathematics' },
        { id: 'cs', position: [4, 1, 0] as [number, number, number], color: '#8b5cf6', label: 'Computer Science' },
        { id: 'phys', position: [0, -3, 2] as [number, number, number], color: '#ec4899', label: 'Physics' },
    ];

    const concepts = [
        { parent: 'math', position: [-5, 3, 2] as [number, number, number], label: 'Algebra' },
        { parent: 'math', position: [-3, 4, -1] as [number, number, number], label: 'Calculus' },
        { parent: 'cs', position: [5, 2, 1] as [number, number, number], label: 'React' },
        { parent: 'cs', position: [3, 0, -2] as [number, number, number], label: 'Python' },
        { parent: 'phys', position: [-1, -4, 3] as [number, number, number], label: 'Mechanics' },
    ];

    return (
        <div className="w-full h-[400px] bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Knowledge Galaxy
                </h3>
                <p className="text-slate-400 text-sm">Interactive Mastery Map</p>
            </div>

            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 5, 20]} />

                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} />

                <group rotation={[0, 0, 0.1]}>
                    {/* Central Core */}
                    <GlowingNode position={[0, 0, 0]} color="#f59e0b" label="Mastery Core" size={1.5} />

                    {/* Subjects */}
                    {subjects.map((sub, i) => (
                        <group key={i}>
                            <GlowingNode
                                position={sub.position}
                                color={sub.color}
                                label={sub.label}
                                size={0.8}
                            />
                            <ConnectionLine start={[0, 0, 0]} end={sub.position} color={sub.color} />
                        </group>
                    ))}

                    {/* Concepts */}
                    {concepts.map((concept, i) => {
                        const parent = subjects.find(s => s.id === concept.parent);
                        if (!parent) return null;

                        return (
                            <group key={`c-${i}`}>
                                <GlowingNode
                                    position={concept.position}
                                    color={parent.color}
                                    label={concept.label}
                                    size={0.4}
                                />
                                <ConnectionLine start={parent.position} end={concept.position} color={parent.color} />
                            </group>
                        );
                    })}
                </group>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default KnowledgeConstellation;
