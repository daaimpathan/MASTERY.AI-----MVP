export class FocusAudioEngine {
    private ctx: AudioContext | null = null;
    private voidGain: GainNode | null = null;
    private noiseNode: AudioBufferSourceNode | null = null;

    constructor() {
        // Lazy init to respect browser policies
    }

    private initCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    // --- BROWN NOISE GENERATOR (The Void) ---
    private createBrownNoise() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5; // Compensate for gain loss
        }
        return buffer;
    }

    public playVoidLoop() {
        const ctx = this.initCtx();
        if (this.noiseNode) return; // Already playing

        const buffer = this.createBrownNoise();
        if (!buffer) return;

        this.noiseNode = ctx.createBufferSource();
        this.noiseNode.buffer = buffer;
        this.noiseNode.loop = true;

        // Lowpass filter for deep rumble
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 120; // Deep rumble

        this.voidGain = ctx.createGain();
        this.voidGain.gain.value = 0; // Fade in

        this.noiseNode.connect(filter);
        filter.connect(this.voidGain);
        this.voidGain.connect(ctx.destination);

        this.noiseNode.start();

        // Fade in
        this.voidGain.gain.exponentialRampToValueAtTime(0.8, ctx.currentTime + 3);
    }

    public stopVoidLoop() {
        if (this.ctx && this.voidGain) {
            this.voidGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
            setTimeout(() => {
                if (this.noiseNode) {
                    this.noiseNode.stop();
                    this.noiseNode = null;
                }
            }, 2000);
        }
    }

    // --- WARP DRIVE SOUND (Entrance) ---
    public playWarp() {
        const ctx = this.initCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 2);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.5);

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2);
    }

    // --- ALERT SOUND (Distraction) ---
    public playAlert() {
        const ctx = this.initCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }
}
