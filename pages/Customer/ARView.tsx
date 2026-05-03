import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  Box,
  Crosshair,
  RotateCcw,
  AlertTriangle,
  Bug,
} from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { db } from '../../services/db';
import { useCart } from '../../contexts/CartContext';
import { ColorTintedImage } from '../../components/ColorTintedImage';
import { CURRENCY, resolveAssetUrl } from '../../constants';

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
      // Access the internal canvas of model-viewer for recording
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

  // Pre-compute Scene Viewer intent URL for Android
  const modelUrl = resolveAssetUrl(product?.arModelUrl);
  const intentUrl = React.useMemo(() => {
    if (!modelUrl || !platform.isAndroid || !product) return '';
    const title = encodeURIComponent(product.name || 'Furniture');
    return (
      `intent://arvr.google.com/scene-viewer/1.0?` +
      `file=${encodeURIComponent(modelUrl)}` +
      `&mode=ar_preferred` +
      `&title=${title}` +
      `&resizable=true` +
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
        setShowPlaced(true);
        setTimeout(() => setShowPlaced(false), 2000);
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
        throw new Error('AR requires a mobile device with a camera. Please scan the QR code on your phone.');
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
    if (viewer && viewer.resetARPlacement) {
      viewer.resetARPlacement();
    }
    setShowPlaced(true);
    setTimeout(() => setShowPlaced(false), 2000);
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
          shadow-intensity="2"
          shadow-softness="0.5"
          camera-controls
          auto-rotate={!inAR}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          ar-scale="fixed"
          environment-image="neutral"
          exposure="1.2"
          loading="eager"
          reveal="auto"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto 150%"
          interaction-prompt="auto"
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
            className={
              platform.isIOS
                ? 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] z-50 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/50 hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-3 border border-indigo-400/30 cursor-pointer'
                : 'opacity-0 pointer-events-none absolute w-0 h-0'
            }
          >
            <Box className="w-6 h-6" />
            View in AR
          </button>
        </ModelViewer>
      </div>

      {/* --- WebXR Record Toggle (Shows only during AR session) --- */}
      {inAR && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
           <button
             onClick={toggleRecording}
             className={`pointer-events-auto px-6 py-3 rounded-full font-bold text-white shadow-xl transition-all flex items-center gap-2 ${isRecording ? 'bg-rose-600 animate-pulse' : 'bg-black/40 backdrop-blur-md border border-white/20 hover:bg-black/60'}`}
           >
             <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-white' : 'bg-rose-600'}`} />
             {isRecording ? 'Stop Recording' : 'Record View'}
           </button>
        </div>
      )}

      {/* --- Top Overlay Bar --- */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-bold border border-white/10 hover:bg-black/70 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {!inAR && !arError && (
          <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Point at floor</span>
          </div>
        )}

        {showPlaced && (
          <div className="bg-emerald-500/90 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-400/30 flex items-center gap-2 animate-in zoom-in duration-200">
            <Box className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white">Placed!</span>
          </div>
        )}

        <button
          onClick={() => {
            updateDiagnostics();
            setShowDebug(prev => !prev);
          }}
          className="pointer-events-auto p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 text-white/60 hover:text-white transition-colors"
          title="Toggle diagnostics"
        >
          <Bug className="w-4 h-4" />
        </button>
      </div>

      {/* --- Desktop / Error Overlay --- */}
      {!inAR && arError && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-sm text-center shadow-2xl">
            <div className="w-14 h-14 bg-orange-500/20 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">AR Not Available</h2>
            <p className="text-slate-400 text-sm mb-6">{arError}</p>
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
              {platform.isDesktop && (
                <Link
                  to={`/product/${product._id}`}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all flex items-center justify-center"
                >
                  Get QR Code
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Center "Launch AR" Prompt --- */}
      {!inAR && !arError && !platform.isIOS && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-3 border border-white/20 rounded-full" />
              <Crosshair className="absolute inset-0 m-auto w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-white/90 text-lg font-bold mb-2 drop-shadow-lg">Ready to place in your room</h2>
            <p className="text-white/50 text-xs font-medium mb-6 max-w-[220px] mx-auto">
              Tap below to start AR. Point your camera at the floor and move slowly.
            </p>

            <button
              disabled={launchingAR}
              onClick={launchAR}
              className={`bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/50 transition-all flex items-center gap-3 mx-auto border border-indigo-400/30 ${
                launchingAR ? 'opacity-80 cursor-wait' : 'hover:bg-indigo-500 active:scale-95'
              }`}
            >
              {launchingAR ? (
                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Box className="w-6 h-6" />
              )}
              {launchingAR ? 'Launching...' : 'View in AR'}
            </button>
          </div>
        </div>
      )}

      {/* iOS center prompt text (button is the native slot above) */}
      {!inAR && !arError && platform.isIOS && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-none">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-3 border border-white/20 rounded-full" />
              <Crosshair className="absolute inset-0 m-auto w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-white/90 text-lg font-bold mb-2 drop-shadow-lg">Ready to place in your room</h2>
            <p className="text-white/50 text-xs font-medium mb-24 max-w-[220px] mx-auto">
              Tap the button below to start AR. Point your camera at the floor and move slowly.
            </p>
          </div>
        </div>
      )}

      {/* --- Bottom Product Overlay Sheet --- */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 transition-transform duration-500 ${inAR ? 'translate-y-0' : ''}`}>
        <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-6 px-5">
          <div className="max-w-md mx-auto">
            {/* Product Card Row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-white/10 shrink-0">
                <ColorTintedImage
                  src={resolveAssetUrl(product.imageUrl)}
                  color={activeColor}
                  alt={product.name}
                  className="w-full h-full"
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-bold text-sm truncate drop-shadow">{product.name}</h3>
                <p className="text-indigo-300 text-xs font-bold">{CURRENCY}{product.price.toLocaleString()}</p>
                <p className="text-white/40 text-[10px] font-medium mt-0.5 truncate">{activeName}</p>
              </div>
            </div>

            {/* Variant Swatches */}
            {product.variants && product.variants.length > 0 && (
              <div className="flex items-center gap-2.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setSelectedVariant(undefined)}
                  className={`relative w-9 h-9 rounded-full border-2 transition-all shrink-0 ${!selectedVariant ? 'border-indigo-400 scale-110' : 'border-white/20 hover:border-white/50'}`}
                  title={product.colorName || 'Base Finish'}
                >
                  <span
                    className="absolute inset-0.5 rounded-full border border-black/20"
                    style={{ backgroundColor: product.color || '#F8F8F8' }}
                  />
                  {!selectedVariant && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-black" />
                  )}
                </button>

                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`relative w-9 h-9 rounded-full border-2 transition-all shrink-0 ${selectedVariant?.id === v.id ? 'border-indigo-400 scale-110' : 'border-white/20 hover:border-white/50'}`}
                    title={v.name}
                  >
                    <span
                      className="absolute inset-0.5 rounded-full border border-black/20"
                      style={{ backgroundColor: v.color }}
                    />
                    {selectedVariant?.id === v.id && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border border-black" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={maxAvailable <= 0}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95 border border-white/10 ${
                  maxAvailable <= 0
                    ? 'bg-slate-700/50 text-slate-400 cursor-not-allowed'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                {maxAvailable <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {inAR ? (
                <button
                  onClick={handleResetPlacement}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Placement
                </button>
              ) : (
                <button
                  disabled={launchingAR}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    launchAR();
                  }}
                  className={`flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-indigo-400/30 ${
                    launchingAR ? 'opacity-80 cursor-wait' : 'hover:bg-indigo-500 active:scale-95'
                  }`}
                >
                  {launchingAR ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Box className="w-4 h-4" />
                  )}
                  {launchingAR ? 'Launching...' : 'View in AR'}
                </button>
              )}
            </div>

            {inAR && (
              <p className="text-center text-white/30 text-[10px] font-medium mt-3 uppercase tracking-widest">
                Drag to move · Pinch to resize · Two-finger rotate
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
    </div>
  );
};
