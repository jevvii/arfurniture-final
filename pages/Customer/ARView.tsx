import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Box,
  RotateCcw,
  AlertTriangle,
  Bug,
  Plus,
  Minus,
  QrCode,
  Sparkles,
  Crosshair,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { db } from '../../services/db';
import { useCart } from '../../contexts/CartContext';
import { ColorTintedImage } from '../../components/ColorTintedImage';
import { CURRENCY, resolveAssetUrl } from '../../constants';
import { QRCodeModal } from '../../components/QRCodeModal';

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b, 1];
}

export const ARView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const autoLaunch = searchParams.get('autolaunch') === '1';

  const [product, setProduct] = useState<Product | undefined>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [arStatus, setArStatus] = useState<'not-presenting' | 'session-started' | 'object-placed' | 'failed'>('not-presenting');
  const [arError, setArError] = useState<string | null>(null);
  const [showPlaced, setShowPlaced] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [diagnostics, setDiagnostics] = useState<Record<string, string>>({});
  const [launchingAR, setLaunchingAR] = useState(false);
  const [currentScale, setCurrentScale] = useState(1.0);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [arEngine, setArEngine] = useState<'scene-viewer' | 'webxr'>('scene-viewer');
  const [snapToast, setSnapToast] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const viewerRef = useRef<any>(null);
  const arButtonRef = useRef<HTMLButtonElement>(null);

  // Stable platform detection
  const platform = useRef({
    isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
    isAndroid: /Android/i.test(navigator.userAgent),
    isDesktop: !/iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
  }).current;

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const p = await db.getProductById(id);
      setProduct(p);
      setLoading(false);
    };
    load();
  }, [id]);

  // Prefetch 3D model binary into browser cache for instantaneous initialization
  useEffect(() => {
    if (!product?.arModelUrl) return;
    const url = resolveAssetUrl(product.arModelUrl);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'fetch';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [product?.arModelUrl]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Apply color to 3D model materials
  const applyColor = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const model = viewer.model;
    if (!model) return;

    const color = selectedVariant?.color || product?.color;
    if (!color) {
      model.materials.forEach((material: any) => {
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.setBaseColorFactor(null);
        }
      });
      return;
    }

    const [r, g, b, a] = hexToRgba(color);
    model.materials.forEach((material: any) => {
      if (material.pbrMetallicRoughness) {
        material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, a]);
      }
    });
  };

  // Recording Toggle Logic
  const toggleRecording = () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      const canvas = viewerRef.current?.shadowRoot?.querySelector('canvas');
      if (!canvas) {
        setArError('Recording is only available in the integrated browser mode (WebXR).');
        return;
      }

      try {
        recordedChunks.current = [];
        const stream = canvas.captureStream(30);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' });
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) recordedChunks.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ar-capture-${product?.name}-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start recording:', err);
        setArError('Failed to start video recording.');
      }
    }
  };

  // Gather diagnostics whenever relevant state changes
  const updateDiagnostics = async () => {
    const viewer = viewerRef.current;
    let webxrSupport = 'n/a';
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).xr?.isSessionSupported) {
        const supported = await (navigator as any).xr.isSessionSupported('immersive-ar');
        webxrSupport = supported ? 'yes' : 'no';
      } else {
        webxrSupport = 'missing API';
      }
    } catch {
      webxrSupport = 'error';
    }

    const d: Record<string, string> = {
      platform: platform.isIOS ? 'iOS' : platform.isAndroid ? 'Android' : 'Desktop',
      secureContext: typeof window !== 'undefined' && window.isSecureContext ? 'yes' : 'no',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 60) : 'n/a',
      modelUrl: product?.arModelUrl ? resolveAssetUrl(product.arModelUrl) : 'none',
      modelLoaded: modelLoaded ? 'yes' : 'no',
      viewerReady: viewer ? 'yes' : 'no',
      activateARExists: typeof viewer?.activateAR === 'function' ? 'yes' : 'no',
      webxrSupport,
      arStatus,
    };
    setDiagnostics(d);
  };

  // Pre-compute Scene Viewer intent URL for Android (mode=ar_only for instant camera & floor lock)
  const modelUrl = resolveAssetUrl(product?.arModelUrl);
  const intentUrl = React.useMemo(() => {
    if (!modelUrl || !platform.isAndroid || !product) return '';
    const title = encodeURIComponent(product.name || 'Furniture');
    const canonicalLink = encodeURIComponent(
      typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.host}/product/${product._id}`
        : ''
    );
    return (
      `intent://arvr.google.com/scene-viewer/1.0?` +
      `file=${encodeURIComponent(modelUrl)}` +
      `&mode=ar_only` +
      `&title=${title}` +
      `&resizable=false` +
      `&initial_scale=1.0` +
      (canonicalLink ? `&link=${canonicalLink}` : '') +
      `#Intent;` +
      `scheme=https;` +
      `package=com.google.android.googlequicksearchbox;` +
      `action=android.intent.action.VIEW;` +
      `end;`
    );
  }, [modelUrl, platform.isAndroid, product]);

  // Listen for model load and AR status
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setModelLoaded(true);
      setModelError(null);
      applyColor();
      updateDiagnostics();
    };

    const handleError = (e: any) => {
      console.error('Model Viewer error:', e);
      setModelError('Failed to load 3D model. Please check your connection or the file path.');
      setModelLoaded(false);
      updateDiagnostics();
    };

    const handleArStatus = (e: any) => {
      const status = e.detail?.status || 'not-presenting';
      setArStatus(status);
      updateDiagnostics();
      
      if (status === 'failed') {
        setLaunchingAR(false);
        setArError('AR failed to start. This usually happens if your device does not support ARCore or if your browser is missing necessary permissions.');
      }

      if (status === 'object-placed') {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate([40, 50, 40]);
          } catch {}
        }
        setShowPlaced(true);
        setTimeout(() => setShowPlaced(false), 2500);
      }
    };

    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('error', handleError);
    viewer.addEventListener('ar-status', handleArStatus);

    if (viewer.model) {
       setModelLoaded(true);
       applyColor();
    }
    updateDiagnostics();

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('error', handleError);
      viewer.removeEventListener('ar-status', handleArStatus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, selectedVariant]);

  // Ensure color stays synced during AR session
  useEffect(() => {
    applyColor();
  }, [selectedVariant, product]);

  // Reset AR launch state when user returns from background (e.g. Scene Viewer)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setLaunchingAR(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Auto-launch on Android when coming from QR scan
  useEffect(() => {
    if (!autoLaunch || !product || loading || !modelLoaded || launchingAR) return;
    if (arStatus !== 'not-presenting') return;
    if (platform.isIOS) return; 

    const timer = setTimeout(() => {
      launchAR();
    }, 500); 
    return () => clearTimeout(timer);
  }, [autoLaunch, product, loading, modelLoaded, arStatus]);

  const handleBack = () => {
    if (product) navigate(`/product/${product._id}`);
    else navigate('/');
  };

  const launchAR = async () => {
    if (launchingAR) return;
    setLaunchingAR(true);
    setArError(null);

    const safetyTimeout = setTimeout(() => {
      setLaunchingAR(false);
    }, 10000);

    try {
      const viewer = viewerRef.current;
      if (!viewer) throw new Error('3D viewer not initialized.');

      if (platform.isDesktop) {
        setIsQRModalOpen(true);
        setLaunchingAR(false);
        clearTimeout(safetyTimeout);
        return;
      }

      if (platform.isIOS) {
        if (arButtonRef.current) {
          arButtonRef.current.click();
        } else {
          throw new Error('AR button not found.');
        }
        clearTimeout(safetyTimeout);
        return;
      }

      if (platform.isAndroid && arEngine === 'scene-viewer' && intentUrl) {
        // Fast-path: Launch Google Scene Viewer with mode=ar_only for instant native ARCore floor detection
        window.location.href = intentUrl;
        setTimeout(() => {
          if (document.visibilityState === 'visible' && typeof viewer.activateAR === 'function') {
            viewer.activateAR().catch(() => {});
          }
          setLaunchingAR(false);
        }, 1500);
        clearTimeout(safetyTimeout);
        return;
      }

      if (!modelLoaded) {
        throw new Error('3D model is still downloading. Please wait for the spinner to disappear.');
      }

      const isSecure = typeof window !== 'undefined' && window.isSecureContext;
      if (!isSecure) {
        console.warn('Insecure context detected. WebXR will be disabled, falling back to Scene Viewer.');
      }

      if (typeof viewer.activateAR === 'function') {
        await viewer.activateAR();
      } else {
        throw new Error('AR activation is not supported by your browser.');
      }

    } catch (e: any) {
      console.error('AR launch error:', e);
      setArError(e?.message || 'Failed to start AR.');
      setLaunchingAR(false);
    } finally {
      clearTimeout(safetyTimeout);
    }
  };

  const handleResetPlacement = () => {
    const viewer = viewerRef.current;
    if (viewer) {
      if (typeof viewer.activateAR === 'function' && arStatus === 'session-started') {
        viewer.activateAR().catch(() => {});
      }
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }
    setSnapToast(true);
    setTimeout(() => setSnapToast(false), 2200);
  };

  const adjustScale = (delta: number) => {
    setCurrentScale(prev => Math.min(2.0, Math.max(0.2, prev + delta)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, 1);
  };

  if (loading || !product) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading 3D model...</p>
      </div>
    );
  }

  const activeColor = selectedVariant?.color || product.color;
  const activeName = selectedVariant?.name || product.colorName || 'Base Finish';
  const maxAvailable = selectedVariant?.stock ?? product.stock;
  const inAR = arStatus === 'session-started' || arStatus === 'object-placed';

  const ModelViewer = 'model-viewer' as any;

  return (
    <div className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">
      {/* --- Full-screen 3D / AR Viewer --- */}
      <div className="absolute inset-0 w-full h-full">
        <ModelViewer
          ref={viewerRef}
          src={resolveAssetUrl(product.arModelUrl)}
          poster={resolveAssetUrl(product.imageUrl)}
          alt={`AR view of ${product.name}`}
          shadow-intensity="1.8"
          shadow-softness="0.75"
          camera-controls
          auto-rotate={!inAR}
          ar
          ar-modes={arEngine === 'webxr' ? 'webxr scene-viewer quick-look' : 'scene-viewer webxr quick-look'}
          quick-look-browsers="safari chrome"
          ar-placement="floor"
          ar-scale="fixed"
          scale={`${currentScale} ${currentScale} ${currentScale}`}
          environment-image="neutral"
          exposure="1.1"
          loading="eager"
          reveal="auto"
          interpolation-decay="200"
          interaction-prompt="none"
          touch-action="pan-y"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto 150%"
          className="w-full h-full"
          style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
        >
          {/* Poster slot */}
          <div slot="poster" className="w-full h-full flex items-center justify-center bg-black">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-bold">Loading 3D model...</p>
            </div>
          </div>

          <button
            ref={arButtonRef}
            slot="ar-button"
            className="opacity-0 pointer-events-none absolute w-0 h-0 -z-10"
            aria-hidden="true"
          />
        </ModelViewer>
      </div>

      {/* --- Real-Time Floor Scanning Guidance Radar (WebXR Plane Detection) --- */}
      {arStatus === 'session-started' && !showPlaced && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center pointer-events-none px-6 text-center animate-in fade-in duration-300">
          <div className="relative w-44 h-44 mb-5">
            {/* 3D floor perspective wireframe grid */}
            <div className="absolute inset-0 border-2 border-cyan-400/50 rounded-3xl [transform:perspective(260px)_rotateX(60deg)] animate-pulse bg-cyan-500/10 shadow-[0_0_30px_rgba(34,211,238,0.25)]" />
            <div className="absolute inset-3 border border-indigo-400/30 rounded-2xl [transform:perspective(260px)_rotateX(60deg)]" />
            {/* Laser scanning beam */}
            <div className="absolute inset-x-2 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[bounce_2s_ease-in-out_infinite] shadow-[0_0_15px_#22d3ee]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Crosshair className="w-10 h-10 text-cyan-300 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          <div className="bg-black/85 backdrop-blur-xl px-5 py-3 rounded-2xl border border-cyan-400/30 shadow-2xl max-w-xs">
            <p className="text-white font-black text-sm tracking-wide flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Scanning Floor Surface...
            </p>
            <p className="text-slate-300 text-xs mt-1 leading-snug">
              Point your camera at the floor and move your phone slowly side-to-side
            </p>
          </div>
        </div>
      )}

      {/* --- Floor Alignment Toast --- */}
      {snapToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-emerald-300/40 text-xs font-bold animate-in fade-in zoom-in duration-150 flex items-center gap-2 shadow-2xl">
          <Crosshair className="w-4 h-4" />
          <span>Floor Alignment Re-calibrated!</span>
        </div>
      )}

      {/* --- WebXR UI (Record / Snap / Scale) --- */}
      {inAR && (
        <div className="absolute top-20 left-4 right-4 z-50 flex flex-col items-center gap-3 pointer-events-none">
           <div className="flex gap-2 pointer-events-auto">
             <button
               onClick={toggleRecording}
               className={`px-6 py-3 rounded-full font-bold text-white shadow-xl transition-all flex items-center gap-2 ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60'}`}
             >
               <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-600'}`} />
               {isRecording ? 'Stop' : 'Record'}
             </button>

             <button
               onClick={handleResetPlacement}
               className="px-6 py-3 rounded-full font-bold text-white bg-indigo-600/90 backdrop-blur-md border border-indigo-400/30 shadow-xl hover:bg-indigo-500 transition-all flex items-center gap-2"
             >
               <RotateCcw className="w-4 h-4" />
               Snap to Floor
             </button>
           </div>

           <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex items-center gap-4">
              <button onClick={() => adjustScale(-0.05)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold hover:bg-white/20">-</button>
              <span className="text-white font-mono text-xs w-12 text-center">{Math.round(currentScale * 100)}%</span>
              <button onClick={() => adjustScale(0.05)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold hover:bg-white/20">+</button>
           </div>
        </div>
      )}

      {/* --- Top Overlay Bar --- */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto flex items-center gap-2 bg-black/60 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-bold border border-white/10 hover:bg-black/80 transition-all active:scale-95 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {!inAR && !arError && (
          <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 flex items-center gap-2 text-white/80 text-xs font-semibold shadow-lg">
            <Box className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive 3D · Rotate & Zoom</span>
          </div>
        )}

        {showPlaced && (
          <div className="bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-400/30 flex items-center gap-2 animate-in zoom-in duration-200 shadow-lg">
            <Box className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">Floor Locked · 1:1 Scale Snapped</span>
          </div>
        )}

        <button
          onClick={() => {
            updateDiagnostics();
            setShowDebug(prev => !prev);
          }}
          className="pointer-events-auto p-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors shadow-lg"
          title="Toggle diagnostics"
        >
          <Bug className="w-4 h-4" />
        </button>
      </div>

      {/* --- Error Overlay --- */}
      {!inAR && arError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">AR Notice</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {arError}
              {platform.isAndroid && (
                <span className="block mt-3 p-3 bg-white/5 rounded-lg border border-white/10 text-[11px] text-slate-500 text-left">
                  <strong>Troubleshooting:</strong>
                  <br />• Ensure you are using <strong>Chrome</strong>.
                  <br />• Update <strong>Google Play Services for AR</strong>.
                  <br />• ARCore is required for floor placement.
                </span>
              )}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setArError(null);
                    setLaunchingAR(false);
                  }}
                  className="flex-1 bg-slate-800 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Dismiss
                </button>
                {platform.isAndroid && intentUrl && (
                  <button
                    onClick={() => {
                      setArError(null);
                      setLaunchingAR(true);
                      window.location.href = intentUrl;
                      setTimeout(() => setLaunchingAR(false), 2000);
                    }}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Box className="w-4 h-4" />
                    Try Fallback
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setArError(null);
                  setIsQRModalOpen(true);
                }}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Open Mobile QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Bottom Product & Action Sheet (Mobile Ergonomic Thumb Zone) --- */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-300 pointer-events-none pb-4 sm:pb-6`}>
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-2 px-4">
          <div className="max-w-md mx-auto pointer-events-auto flex flex-col gap-3">

            {/* Product Card Row with Compact Scale */}
            <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-xl rounded-2xl p-3 border border-white/15 shadow-2xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 bg-white/10 shrink-0">
                  <ColorTintedImage
                    src={resolveAssetUrl(product.imageUrl)}
                    color={activeColor}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm truncate drop-shadow">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-indigo-300 font-extrabold text-sm">{CURRENCY}{product.price.toLocaleString()}</span>
                    <span className="text-white/30 text-xs">•</span>
                    <span className="text-white/60 text-xs truncate max-w-[120px]">{activeName}</span>
                  </div>
                </div>
              </div>

              {/* Compact Scale Calibration */}
              {!inAR && (
                <div className="flex items-center gap-1 bg-black/40 border border-white/15 rounded-xl px-2 py-1 shrink-0">
                  <button
                    onClick={() => adjustScale(-0.1)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all"
                    title="Shrink scale"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <div className="text-center px-1">
                    <span className="text-xs font-mono font-bold text-white block leading-tight">{Math.round(currentScale * 100)}%</span>
                    <span className="text-[8px] text-indigo-300 uppercase font-semibold tracking-tighter block">Scale</span>
                  </div>
                  <button
                    onClick={() => adjustScale(0.1)}
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white transition-all"
                    title="Enlarge scale"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Variant Swatches (if available) */}
            {(product.variants && product.variants.length > 0) && (
              <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 px-1 scrollbar-none">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider shrink-0">Finish:</span>
                <button
                  onClick={() => setSelectedVariant(undefined)}
                  className={`relative w-8 h-8 rounded-full border-2 transition-all shrink-0 ${!selectedVariant ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-110' : 'border-white/20 hover:border-white/40'}`}
                  title="Original finish"
                >
                  <span className="absolute inset-0.5 rounded-full border border-black/20" style={{ backgroundColor: product.color || '#F8F8F8' }} />
                  {!selectedVariant && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-black" />
                  )}
                </button>
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`relative w-8 h-8 rounded-full border-2 transition-all shrink-0 ${selectedVariant?.id === v.id ? 'border-indigo-400 ring-2 ring-indigo-400/40 scale-110' : 'border-white/20 hover:border-white/40'}`}
                    title={v.name}
                  >
                    <span className="absolute inset-0.5 rounded-full border border-black/20" style={{ backgroundColor: v.color }} />
                    {selectedVariant?.id === v.id && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border border-black" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Android AR Tracking Engine Switcher */}
            {platform.isAndroid && !inAR && (
              <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-1 text-[11px] font-bold">
                <span className="text-white/50 px-2 uppercase tracking-wider text-[9px]">Tracking:</span>
                <div className="flex gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => setArEngine('scene-viewer')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      arEngine === 'scene-viewer'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    ⚡ Fast ARCore
                  </button>
                  <button
                    type="button"
                    onClick={() => setArEngine('webxr')}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-center transition-all ${
                      arEngine === 'webxr'
                        ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    🌐 WebXR
                  </button>
                </div>
              </div>
            )}

            {/* Primary Action Button (The Ergonomic Mobile Thumb Zone) */}
            <div className="flex gap-2.5 items-center">
              <button
                onClick={handleAddToCart}
                disabled={maxAvailable <= 0}
                className={`h-14 px-5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 border ${
                  maxAvailable <= 0
                    ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
                title={maxAvailable <= 0 ? 'Out of Stock' : 'Add to Cart'}
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden xs:inline">Add to Cart</span>
              </button>

              {!inAR && (
                <button
                  disabled={launchingAR || !modelLoaded}
                  onClick={launchAR}
                  className={`flex-1 h-14 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-black text-base rounded-2xl shadow-2xl shadow-indigo-600/40 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] border border-indigo-400/30 ${
                    (launchingAR || !modelLoaded) ? 'opacity-80 cursor-wait' : 'cursor-pointer'
                  }`}
                >
                  {(launchingAR || !modelLoaded) ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-sm font-bold tracking-wide">
                        {!modelLoaded ? 'Loading 3D Model...' : 'Launching AR...'}
                      </span>
                    </>
                  ) : platform.isDesktop ? (
                    <>
                      <QrCode className="w-5 h-5 text-indigo-200" />
                      <span>Scan QR for Mobile AR</span>
                    </>
                  ) : (
                    <>
                      <Box className="w-5 h-5 text-indigo-200" />
                      <span>View in Your Room (AR)</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {inAR && (
              <p className="text-center text-white/40 text-[11px] font-medium mt-1 uppercase tracking-wider">
                Drag to move · Pinch to rotate & scale
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- Diagnostics Overlay --- */}
      {showDebug && (
        <div className="absolute top-16 right-4 z-[60] bg-black/90 backdrop-blur-md border border-white/20 rounded-xl p-4 max-w-xs text-left shadow-2xl">
          <h4 className="text-white font-bold text-xs mb-2 uppercase tracking-wider">AR Diagnostics</h4>
          <div className="space-y-1">
            {Object.entries(diagnostics).map(([key, value]) => (
              <div key={key} className="flex justify-between gap-4 text-[11px]">
                <span className="text-slate-400 font-medium">{key}</span>
                <span className={`font-mono font-bold ${value === 'yes' ? 'text-emerald-400' : value === 'no' ? 'text-rose-400' : 'text-white'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
            Tap the bug icon again to hide. Screenshot this and send it if AR still fails.
          </p>
        </div>
      )}

      {/* --- Desktop QR Modal --- */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        productId={product._id}
        productName={product.name}
      />
    </div>
  );
};
