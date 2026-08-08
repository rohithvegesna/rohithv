/* Synth audio: engine loop, night ambience, interaction effects.
   Created on first user input; mute persisted (nr-audio). */
export function createAudio() {
  let ctx = null;
  let master = null;
  let engineOsc = null;
  let engineGain = null;
  let muted =
    typeof localStorage !== "undefined" && localStorage.getItem("nr-audio") === "muted";

  const ensure = () => {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 1;
    master.connect(ctx.destination);
    // night ambience: filtered noise bed
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let seed = 42;
    for (let i = 0; i < len; i++) {
      seed = (seed * 16807) % 2147483647;
      d[i] = (seed / 2147483647 - 0.5) * 2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = "lowpass";
    nf.frequency.value = 320;
    const ng = ctx.createGain();
    ng.gain.value = 0.014;
    noise.connect(nf); nf.connect(ng); ng.connect(master);
    noise.start();
    // engine: saw through lowpass, pitch follows speed
    engineOsc = ctx.createOscillator();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 40;
    const ef = ctx.createBiquadFilter();
    ef.type = "lowpass";
    ef.frequency.value = 420;
    engineGain = ctx.createGain();
    engineGain.gain.value = 0;
    engineOsc.connect(ef); ef.connect(engineGain); engineGain.connect(master);
    engineOsc.start();
  };

  const note = (freq, dur, type = "square", gain = 0.06, when = 0) => {
    if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t = ctx.currentTime + when;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  };

  return {
    get muted() { return muted; },
    unlock() { ensure(); ctx?.resume(); },
    toggle() {
      muted = !muted;
      localStorage.setItem("nr-audio", muted ? "muted" : "on");
      if (master) master.gain.linearRampToValueAtTime(muted ? 0 : 1, ctx.currentTime + 0.15);
      return muted;
    },
    engine(speed, throttle) {
      if (!engineOsc) return;
      engineOsc.frequency.value = 42 + speed * 7 + throttle * 14;
      engineGain.gain.value = Math.min(0.05, 0.012 + speed * 0.002 + throttle * 0.02);
    },
    pumpClick() { note(880, 0.06, "square", 0.05); },
    fuelFlow(on) {
      if (!ctx) return;
      if (on && !this._flow) {
        const o = ctx.createOscillator();
        o.type = "triangle"; o.frequency.value = 90;
        const g = ctx.createGain(); g.gain.value = 0.02;
        o.connect(g); g.connect(master); o.start();
        this._flow = { o, g };
      } else if (!on && this._flow) {
        this._flow.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        this._flow.o.stop(ctx.currentTime + 0.15);
        this._flow = null;
      }
    },
    approve() { note(1046, 0.09, "sine", 0.07); note(1318, 0.14, "sine", 0.07, 0.09); },
    chime() { note(784, 0.12, "sine", 0.06); note(988, 0.16, "sine", 0.06, 0.11); },
    beep() { note(1200, 0.07, "square", 0.05); },
    perfect() { note(659, 0.1, "triangle", 0.07); note(880, 0.1, "triangle", 0.07, 0.09); note(1108, 0.22, "triangle", 0.07, 0.18); },
  };
}
