import React, { useEffect, useRef } from 'react';

interface ModelViewerProps {
  src: string;
  iosSrc?: string;
  poster?: string;
  alt: string;
  // Hex color to tint the model materials at runtime
  color?: string;
  // Callback when user clicks the AR button (parent handles QR modal or navigation)
  onARClick?: () => void;
}

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b, 1];
}

export const ModelViewerWrapper: React.FC<ModelViewerProps> = ({ src, iosSrc, poster, alt, color, onARClick }) => {
  const viewerRef = useRef<any>(null);
  const [downloadProgress, setDownloadProgress] = React.useState<number>(0);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);

  // Cast to 'any' to bypass TypeScript IntrinsicElements check for custom web components
  const ModelViewer = 'model-viewer' as any;

  const applyColor = () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const model = viewer.model;
    if (!model) return;

    if (!color) {
      // Reset to original material colors if no color is provided
      model.materials.forEach((material: any) => {
        if (material.pbrMetallicRoughness) {
          // Setting to null or an empty array resets to glTF original
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

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setLoadError(null);
    setIsLoaded(false);
    setDownloadProgress(0);

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadError(null);
      setDownloadProgress(100);
      applyColor();
    };

    const handleProgress = (e: any) => {
      const progress = e.detail?.totalProgress ?? 0;
      setDownloadProgress(Math.min(99, Math.round(progress * 100)));
    };

    const handleError = (e: any) => {
      console.warn('Model Viewer error on src:', src, e);
      setLoadError('Failed to load 3D model. Tap to retry.');
    };

    // model-viewer event listeners
    viewer.addEventListener('load', handleLoad);
    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('error', handleError);

    // If model is already loaded, apply immediately
    if (viewer.model) {
      setIsLoaded(true);
      applyColor();
    }

    return () => {
      viewer.removeEventListener('load', handleLoad);
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('error', handleError);
    };
  }, [src]);

  // Re-apply color when it changes
  useEffect(() => {
    applyColor();
  }, [color]);

  const handleRetry = () => {
    setLoadError(null);
    setDownloadProgress(0);
    const viewer = viewerRef.current;
    if (viewer) {
      const currentSrc = viewer.src;
      viewer.src = '';
      setTimeout(() => {
        viewer.src = currentSrc;
      }, 50);
    }
  };

  return (
    <div className="w-full h-full bg-slate-100 rounded-xl overflow-hidden relative group">
      <ModelViewer
        ref={viewerRef}
        src={src}
        ios-src={iosSrc}
        poster={poster}
        alt={alt}
        shadow-intensity="1.8"
        shadow-softness="0.75"
        camera-controls
        auto-rotate
        ar
        ar-modes="scene-viewer webxr quick-look"
        quick-look-browsers="safari chrome"
        ar-placement="floor"
        ar-scale="fixed"
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
        crossorigin="anonymous"
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      >
        <button
          onClick={onARClick}
          className="absolute bottom-4 right-4 bg-indigo-600 text-white px-5 py-2.5 rounded-full font-bold shadow-2xl cursor-pointer hover:bg-indigo-700 transition-all flex items-center gap-2 z-30 active:scale-95 border-none outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"></path></svg>
          <span className="text-sm font-bold">View in AR</span>
        </button>

        {/* Loading poster with active progress indicator */}
        <div slot="poster" className="w-full h-full flex items-center justify-center bg-slate-100">
          <div className="w-full h-full relative">
            <img src={poster} alt={alt} className="w-full h-full object-contain opacity-50 blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]">
              {loadError ? (
                <div className="text-center p-4 bg-white/90 rounded-2xl shadow-xl max-w-xs mx-4">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mb-3">{loadError}</p>
                  <button
                    onClick={handleRetry}
                    className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Retry Loading
                  </button>
                </div>
              ) : (
                <div className="text-center p-4 bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 min-w-[200px]">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2.5"></div>
                  <p className="text-xs text-slate-800 font-bold uppercase tracking-wider mb-2">Loading 3D Model</p>
                  <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden mx-auto mb-1">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-200"
                      style={{ width: `${Math.max(8, downloadProgress)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-500">{downloadProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ModelViewer>

      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium text-slate-600 pointer-events-none">
        Interactive 3D
      </div>
    </div>
  );
};
