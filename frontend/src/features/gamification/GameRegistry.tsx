import type { ComponentType } from 'react';
import NeuralPattern from './games/NeuralPattern';
import QuantumMath from './games/QuantumMath';
import LexicalVoids from './games/LexicalVoids';

// Game Metadata Interface
export interface GameMetadata {
    id: string;
    title: string;
    description: string;
    component: ComponentType<any>;
    color: string; // Tailwind color scheme (e.g., 'violet', 'cyan')
}

// Registry
export const GAME_REGISTRY: Record<string, GameMetadata> = {
    'neural_pattern': {
        id: 'neural_pattern',
        title: 'Neural Pattern',
        description: 'Memorize and replicate the neural firing sequence.',
        component: NeuralPattern,
        color: 'violet'
    },
    'quantum_math': {
        id: 'quantum_math',
        title: 'Quantum Math',
        description: 'Solve rapid-fire equations to stabilize the quantum core.',
        component: QuantumMath,
        color: 'cyan'
    },
    'lexical_voids': {
        id: 'lexical_voids',
        title: 'Lexical Voids',
        description: 'Fill in the missing data shards to restore the archives.',
        component: LexicalVoids,
        color: 'emerald'
    },
    'astro_focus': {
        id: 'astro_focus',
        title: 'Astro Focus',
        description: 'Test your reaction time against cosmic events.',
        component: () => <div className="text-white text-center p-10 font-mono">ASTRO FOCUS: SYSTEM INITIALIZING...</div>,
        color: 'amber'
    },
    'cosmic_sequence': {
        id: 'cosmic_sequence',
        title: 'Cosmic Sequence',
        description: 'Order the planetary alignments correctly.',
        component: () => <div className="text-white text-center p-10 font-mono">COSMIC SEQUENCE: LOADING ALGORITHMS...</div>,
        color: 'fuchsia'
    },
    'nebula_navigator': {
        id: 'nebula_navigator',
        title: 'Nebula Navigator',
        description: 'Navigate the maze of nebular gases.',
        component: () => <div className="text-white text-center p-10 font-mono">NEBULA NAVIGATOR: COMING SOON</div>,
        color: 'blue'
    },
    'gravity_well': {
        id: 'gravity_well',
        title: 'Gravity Well',
        description: 'Calculate trajectories to escape the black hole.',
        component: () => <div className="text-white text-center p-10 font-mono">GRAVITY WELL: SIMULATION PENDING</div>,
        color: 'rose'
    },
    'stellar_synthesis': {
        id: 'stellar_synthesis',
        title: 'Stellar Synthesis',
        description: 'Fuse elements to create new stars.',
        component: () => <div className="text-white text-center p-10 font-mono">STELLAR SYNTHESIS: REACTOR OFFLINE</div>,
        color: 'orange'
    },
    'void_echoes': {
        id: 'void_echoes',
        title: 'Void Echoes',
        description: 'Match the cosmic audio frequencies.',
        component: () => <div className="text-white text-center p-10 font-mono">VOID ECHOES: AUDIO SYSTEM CALIBRATING</div>,
        color: 'slate'
    },
    'photon_stream': {
        id: 'photon_stream',
        title: 'Photon Stream',
        description: 'Direct the laser beams to the receivers.',
        component: () => <div className="text-white text-center p-10 font-mono">PHOTON STREAM: OPTICS ALIGNING</div>,
        color: 'yellow'
    },
    'orbital_resonance': {
        id: 'orbital_resonance',
        title: 'Orbital Resonance',
        description: 'Sync your movements with the orbital beat.',
        component: () => <div className="text-white text-center p-10 font-mono">ORBITAL RESONANCE: RHYTHM DETECTED</div>,
        color: 'pink'
    },
    'dark_matter_miner': {
        id: 'dark_matter_miner',
        title: 'Dark Matter Miner',
        description: 'Extract resources from the quantum foam.',
        component: () => <div className="text-white text-center p-10 font-mono">DARK MATTER MINER: DRILLS DEPLOYING</div>,
        color: 'indigo'
    }
};

export const getGameById = (id: string): GameMetadata => {
    return GAME_REGISTRY[id] || GAME_REGISTRY['neural_pattern']; // Fallback
};
