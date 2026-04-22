'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedImage {
  file: File;
  preview: string;
  name: string;
}

type SwapStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error';

// ─── Custom Cursor ─────────────────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.left = mouseX - 6 + 'px';
        dotRef.current.style.top = mouseY - 6 + 'px';
      }
    };

    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringX + 'px';
        ringRef.current.style.top = ringY + 'px';
      }
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor hidden md:block" />
      <div ref={ringRef} className="cursor-ring hidden md:block" />
    </>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({
  image,
  onUpload,
  label,
  sublabel,
  icon,
  accentColor,
  disabled,
}: {
  image: UploadedImage | null;
  onUpload: (file: File) => void;
  label: string;
  sublabel: string;
  icon: string;
  accentColor: string;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onUpload(file);
  }, [onUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div
      className={`upload-zone rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer group
        ${isDragging ? 'drag-over' : ''}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
      `}
      style={{
        minHeight: '320px',
        borderColor: isDragging ? accentColor : undefined,
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        disabled={disabled}
      />

      {image ? (
        // Image preview
        <div className="relative w-full h-full" style={{ minHeight: '320px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.preview}
            alt={label}
            className="w-full h-full object-cover"
            style={{ minHeight: '320px', maxHeight: '320px' }}
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
            <div className="text-4xl">{icon}</div>
            <p className="text-white font-semibold text-sm">Click to change</p>
          </div>
          {/* Corner brackets */}
          <div className="absolute inset-0 pointer-events-none">
            {/* TL */}
            <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2" style={{ borderColor: accentColor, animation: 'cornerPulse 2s ease-in-out infinite' }} />
            {/* TR */}
            <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2" style={{ borderColor: accentColor, animation: 'cornerPulse 2s ease-in-out infinite 0.5s' }} />
            {/* BL */}
            <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2" style={{ borderColor: accentColor, animation: 'cornerPulse 2s ease-in-out infinite 1s' }} />
            {/* BR */}
            <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2" style={{ borderColor: accentColor, animation: 'cornerPulse 2s ease-in-out infinite 1.5s' }} />
          </div>
          {/* Badge */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2">
            <span className="tag-badge glass text-xs" style={{ color: accentColor, borderColor: accentColor, border: '1px solid' }}>
              {label}
            </span>
          </div>
          <div className="absolute bottom-3 left-0 right-0 text-center">
            <span className="text-xs text-white/60 bg-black/50 px-2 py-1 rounded-full">
              {image.name.length > 20 ? image.name.slice(0, 20) + '…' : image.name}
            </span>
          </div>
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center gap-5 p-8" style={{ minHeight: '320px' }}>
          {/* Animated icon */}
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: `${accentColor}15`, border: `2px dashed ${accentColor}50` }}
            >
              {icon}
            </div>
            <div
              className="absolute -inset-3 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `radial-gradient(circle, ${accentColor}10, transparent)` }}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="font-semibold text-white/90 text-base" style={{ fontFamily: 'var(--font-display)' }}>
              {label}
            </p>
            <p className="text-white/40 text-sm">{sublabel}</p>
          </div>
          <div
            className="tag-badge"
            style={{ background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}40` }}
          >
            Drop or Click to Upload
          </div>
          <p className="text-white/25 text-xs">JPG, PNG, WEBP · Max 10MB</p>
        </div>
      )}
    </div>
  );
}

// ─── Processing Overlay ────────────────────────────────────────────────────────
function ProcessingState({ status }: { status: SwapStatus }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('Initializing AI Engine...');

  const steps = [
    { threshold: 10, text: 'Initializing AI Engine...' },
    { threshold: 25, text: 'Detecting facial landmarks...' },
    { threshold: 45, text: 'Analyzing face geometry...' },
    { threshold: 60, text: 'Neural mesh warping...' },
    { threshold: 75, text: 'Blending skin tones...' },
    { threshold: 88, text: 'Rendering final output...' },
    { threshold: 97, text: 'Applying post-processing...' },
    { threshold: 100, text: 'Almost done...' },
  ];

  useEffect(() => {
    if (status !== 'processing') return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        const next = Math.min(p + Math.random() * 3.5, 97);
        const currentStep = steps.find(s => next <= s.threshold);
        if (currentStep) setStep(currentStep.text);
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(6,6,8,0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="glass-strong rounded-3xl p-10 flex flex-col items-center gap-8 max-w-sm w-full mx-4">
        {/* Animated AI brain */}
        <div className="relative w-28 h-28">
          <div className="absolute inset-0 rounded-full" style={{
            background: 'conic-gradient(from 0deg, #7B2FFF, #00FFB2, #FF2D6B, #7B2FFF)',
            animation: 'spin 3s linear infinite',
            padding: '3px',
          }}>
            <div className="w-full h-full rounded-full" style={{ background: '#0A0A0F' }} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">
            🧠
          </div>
          {/* Pulse rings */}
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                inset: `${-i * 12}px`,
                borderColor: `rgba(0,255,178,${0.3 - i * 0.08})`,
                animation: `pulse ${1 + i * 0.4}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Neural Processing
          </h3>
          <p className="text-sm" style={{ color: '#00FFB2', minHeight: '1.25rem', transition: 'all 0.3s' }}>
            {step}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full progress-neon transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>Processing</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Result Comparison ─────────────────────────────────────────────────────────
function ResultComparison({ original, result }: { original: string; result: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pos = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      updateSlider(x);
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove as EventListener);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove as EventListener);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, updateSlider]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-white/50">
        <span>← Original</span>
        <span className="tag-badge" style={{ background: 'rgba(0,255,178,0.1)', color: '#00FFB2', border: '1px solid rgba(0,255,178,0.3)' }}>
          Drag to Compare
        </span>
        <span>Result →</span>
      </div>
      <div
        ref={containerRef}
        className="comparison-container rounded-2xl overflow-hidden"
        style={{ height: '400px', touchAction: 'none' }}
        onMouseDown={(e) => { setIsDragging(true); updateSlider(e.clientX); }}
        onTouchStart={(e) => { setIsDragging(true); updateSlider(e.touches[0].clientX); }}
      >
        {/* Result (right) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={result} alt="Face swap result" className="absolute inset-0 w-full h-full object-cover select-none" draggable={false} />
        {/* Original (left clip) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={original} alt="Original" className="absolute inset-0 w-full h-full object-cover select-none" draggable={false} />
        </div>
        {/* Slider line */}
        <div
          className="comparison-slider"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="comparison-handle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5l-7 7 7 7M16 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FaceSwapPage() {
  const [source, setSource] = useState<UploadedImage | null>(null); // Face donor
  const [target, setTarget] = useState<UploadedImage | null>(null); // Base image
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (type: 'source' | 'target') => (file: File) => {
    const preview = URL.createObjectURL(file);
    const img: UploadedImage = { file, preview, name: file.name };
    if (type === 'source') setSource(img);
    else setTarget(img);
    setResult(null);
    setError(null);
  };

  const handleSwap = async () => {
    if (!source || !target) return;
    setStatus('processing');
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append('source', source.file); // face to use
      fd.append('target', target.file); // body/base image
      const res = await fetch('/api/faceswap', { method: 'POST', body: fd });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong.');
        setStatus('error');
      } else {
        setResult(data.output);
        setStatus('done');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Network error.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    setSource(null);
    setTarget(null);
    setResult(null);
    setError(null);
    setStatus('idle');
  };

  const canSwap = source && target && status !== 'processing';
  const isProcessing = status === 'processing';

  return (
    <div className="gradient-mesh min-h-screen relative">
      <CustomCursor />
      <div className="noise-overlay" />
      {/* Grid BG */}
      <div className="grid-bg fixed inset-0 pointer-events-none z-0" />

      {/* Processing overlay */}
      {isProcessing && <ProcessingState status={status} />}

      <div className="relative z-10">
        {/* ── Header ─────────────────────────────────── */}
        <header className="py-8 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #00FFB2, #7B2FFF)' }}>
                ✦
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                FaceForge<span className="neon-text">AI</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="tag-badge hidden sm:inline-block" style={{ background: 'rgba(0,255,178,0.08)', color: '#00FFB2', border: '1px solid rgba(0,255,178,0.2)' }}>
                Powered by Replicate
              </span>
              <a
                href="https://replicate.com/account/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/40 hover:text-white/70 transition-colors hidden md:block"
              >
                Get API Key →
              </a>
            </div>
          </div>
        </header>

        {/* ── Hero ───────────────────────────────────── */}
        <section className="px-6 pt-8 pb-16 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#00FFB2' }} />
              <span className="text-xs font-medium" style={{ color: '#00FFB2', fontFamily: 'var(--font-display)', letterSpacing: '0.1em' }}>
                NEURAL FACE SWAP · REAL AI · NO SIMULATION
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Swap Faces
              <br />
              <span className="neon-text">Instantly</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              Upload two photos. Our neural network transplants the face from Photo 1 onto the body in Photo 2 — seamlessly, realistically, in seconds.
            </p>
          </div>
        </section>

        {/* ── Main App ────────────────────────────────── */}
        <main className="px-4 sm:px-6 pb-24">
          <div className="max-w-5xl mx-auto">

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-4 mb-10">
              {[
                { n: 1, label: 'Face Source', done: !!source },
                { n: 2, label: 'Target Photo', done: !!target },
                { n: 3, label: 'AI Processing', done: status === 'done' },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center gap-3">
                  {i > 0 && (
                    <div className="w-12 h-px" style={{ background: step.done ? 'rgba(0,255,178,0.6)' : 'rgba(255,255,255,0.1)' }} />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-300"
                      style={{
                        background: step.done ? '#00FFB2' : 'rgba(255,255,255,0.06)',
                        color: step.done ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${step.done ? '#00FFB2' : 'rgba(255,255,255,0.1)'}`,
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {step.done ? '✓' : step.n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block" style={{ color: step.done ? '#00FFB2' : 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-display)' }}>
                      {step.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#FF2D6B', color: 'white', fontFamily: 'var(--font-display)' }}>1</div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                    FACE SOURCE
                  </h2>
                  <span className="text-xs text-white/30">— The face to transplant</span>
                </div>
                <UploadZone
                  image={source}
                  onUpload={handleUpload('source')}
                  label="Face Donor"
                  sublabel="Photo containing the face to use"
                  icon="👤"
                  accentColor="#FF2D6B"
                  disabled={isProcessing}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#00FFB2', color: '#0A0A0F', fontFamily: 'var(--font-display)' }}>2</div>
                  <h2 className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.8)' }}>
                    TARGET PHOTO
                  </h2>
                  <span className="text-xs text-white/30">— Where to place the face</span>
                </div>
                <UploadZone
                  image={target}
                  onUpload={handleUpload('target')}
                  label="Target Body"
                  sublabel="Photo where the face will be placed"
                  icon="🖼️"
                  accentColor="#00FFB2"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mb-10">
              <button
                onClick={handleSwap}
                disabled={!canSwap}
                className="btn-primary px-12 py-5 rounded-2xl text-lg relative overflow-hidden"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em', minWidth: '260px' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      {status === 'done' ? 'SWAP AGAIN' : 'SWAP FACES NOW'}
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="glass rounded-2xl p-6 mb-8 border border-red-500/30" style={{ background: 'rgba(255,45,107,0.06)' }}>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-400 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Processing Error</h3>
                    <p className="text-red-300/80 text-sm mb-3">{error}</p>
                    {error.includes('REPLICATE_API_TOKEN') && (
                      <div className="glass rounded-xl p-4 text-xs space-y-1" style={{ borderColor: 'rgba(255,45,107,0.2)' }}>
                        <p className="font-semibold text-white/70">Setup Instructions:</p>
                        <p className="text-white/50">1. Visit <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-neon underline">replicate.com/account/api-tokens</a></p>
                        <p className="text-white/50">2. Create a free account and generate an API token</p>
                        <p className="text-white/50">3. Add to <code className="bg-white/10 px-1 rounded">.env.local</code>: <code className="bg-white/10 px-1 rounded">REPLICATE_API_TOKEN=r8_your_token</code></p>
                        <p className="text-white/50">4. Restart the dev server with <code className="bg-white/10 px-1 rounded">npm run dev</code></p>
                      </div>
                    )}
                  </div>
                  <button onClick={handleReset} className="text-white/40 hover:text-white/80 transition-colors text-xl">✕</button>
                </div>
              </div>
            )}

            {/* Result */}
            {result && status === 'done' && target && (
              <div className="result-glow rounded-3xl overflow-hidden glass-strong">
                <div className="p-6 border-b border-white/06 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#00FFB2', boxShadow: '0 0 10px rgba(0,255,178,0.8)' }} />
                    <span className="font-bold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                      RESULT — FACE SWAP COMPLETE
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={result}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="faceforge-result.jpg"
                      className="tag-badge transition-all hover:scale-105"
                      style={{ background: 'rgba(0,255,178,0.1)', color: '#00FFB2', border: '1px solid rgba(0,255,178,0.3)' }}
                    >
                      ↓ Download
                    </a>
                    <button
                      onClick={handleReset}
                      className="tag-badge transition-all hover:scale-105"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      ✕ Reset
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <ResultComparison original={target.preview} result={result} />
                </div>

                {/* Stats */}
                <div className="p-6 pt-0 grid grid-cols-3 gap-4">
                  {[
                    { label: 'AI Model', value: 'lucataco/faceswap' },
                    { label: 'Engine', value: 'Replicate API' },
                    { label: 'Status', value: '✓ Real Output' },
                  ].map(item => (
                    <div key={item.label} className="glass rounded-xl p-3 text-center">
                      <div className="text-xs text-white/40 mb-1" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                        {item.label}
                      </div>
                      <div className="text-xs font-semibold" style={{ color: '#00FFB2' }}>
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ── How it works ──────────────────────────── */}
        <section className="px-6 pb-24 border-t border-white/05 pt-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-center text-3xl font-black mb-12" style={{ fontFamily: 'var(--font-display)' }}>
              How it <span className="neon-text">works</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  icon: '📤',
                  title: 'Upload Two Photos',
                  desc: 'Upload the source face photo and the target body photo. Works with portraits, selfies, or any clear face image.',
                  color: '#FF2D6B',
                },
                {
                  step: '02',
                  icon: '🧬',
                  title: 'Neural Processing',
                  desc: 'Our AI detects facial landmarks, extracts the face mesh, and warps it to fit the target geometry precisely.',
                  color: '#7B2FFF',
                },
                {
                  step: '03',
                  icon: '✨',
                  title: 'Download Result',
                  desc: 'Get a photorealistic merged image. Drag the comparison slider to see the before/after transformation.',
                  color: '#00FFB2',
                },
              ].map(item => (
                <div key={item.step} className="glass rounded-2xl p-6 space-y-4 group hover:border-white/15 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-black" style={{ fontFamily: 'var(--font-display)', color: item.color, letterSpacing: '0.15em' }}>
                      STEP {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ──────────────────────────────────── */}
        <footer className="border-t border-white/05 py-8 px-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
            <p>
              Built with <span className="text-white/50">Next.js 14 + Replicate API</span>
            </p>
            <p className="text-center">
              Requires a{' '}
              <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#00FFB2' }}>
                Replicate API Key
              </a>{' '}
              to function · Use responsibly
            </p>
            <p>© 2024 FaceForge AI</p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}
