import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

const AccretionDisk = () => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Shader for the glowing accretion disk
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#facc15') }, // Gold/Yellow
    }), []);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.z += 0.002;
            uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float uTime;
        
        void main() {
            vUv = uv;
            vPosition = position;
            
            // Swirl effect
            float angle = atan(position.y, position.x);
            float dist = length(position.xy);
            
            vec3 pos = position;
            // Add some wave/turbulence
            pos.z += sin(dist * 10.0 - uTime) * 0.1;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `;

    const fragmentShader = `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform vec3 uColor;
        uniform float uTime;
        
        void main() {
            float dist = length(vPosition.xy);
            
            // Inner hollow (Event Horizon)
            if (dist < 1.5) discard;
            if (dist > 4.0) discard;
            
            // Glow intensity fades out
            float alpha = 1.0 - smoothstep(1.5, 4.0, dist);
            
            // Color variation
            vec3 finalColor = uColor * (1.5 / dist);
            finalColor += vec3(0.8, 0.4, 0.0) * sin(dist * 20.0 - uTime * 2.0);
            
            gl_FragColor = vec4(finalColor, alpha * 0.8);
        }
    `;

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 3, 0, 0]}>
            <ringGeometry args={[1.5, 4, 64]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                transparent={true}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
};

const EventHorizonSphere = () => {
    return (
        <mesh>
            <sphereGeometry args={[1.45, 32, 32]} />
            <meshBasicMaterial color="#000000" />
        </mesh>
    );
};

const BlackHoleScene = () => {
    return (
        <>
            <AccretionDisk />
            <EventHorizonSphere />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.1} />
        </>
    );
};

const BlackHoleBackground = () => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black z-0">
            <Canvas camera={{ position: [0, 5, 8], fov: 45 }}>
                <BlackHoleScene />
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
        </div>
    );
};

export default BlackHoleBackground;
