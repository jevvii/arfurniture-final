import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Box, Crosshair, RotateCcw } from 'lucide-react';
import { Product, ProductVariant } from '../../types';
import { db } from '../../services/db';
import { useCart } from '../../contexts/CartContext';
import { ColorTintedImage } from '../../components/ColorTintedImage';
import { CURRENCY, resolveAssetUrl } from '../../constants';

export const ARView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | undefined>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isARActive, setIsARActive] = useState(false);
  const [showPlaced, setShowPlaced] = useState(false);

  const viewerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const p = await db.getProductById(id);
      setProduct(p);
      setLoading(false);
    };
    load();
  }, [id]);

  // Prevent body scroll when AR view is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleBack = () => {
    if (product) {
      navigate(`/product/${product._id}`);
    } else {
      navigate('/');
    }
  };

  const launchAR = async () => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.activateAR) return;
    try {
      await viewer.activateAR();
      setIsARActive(true);
    } catch (e) {
      console.error('AR activation failed:', e);
    }
  };

  const handlePlace = () => {
    setShowPlaced(true);
    setTimeout(() => setShowPlaced(false), 2000);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedVariant, 1);
  };

  if (loading || !product) {
    return (
      <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading 3D model...</p>
      </div>
    );
  }

  const activeColor = selectedVariant?.color || product.color;
  const activeName = selectedVariant?.name || product.colorName || 'Base Finish';
  const maxAvailable = selectedVariant?.stock ?? product.stock;

  // Cast to bypass TS intrinsic check
  const ModelViewer = 'model-viewer' as any;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[200] bg-black overflow-hidden select-none">
      {/* --- Full-screen 3D / AR Viewer --- */}
      <div className="absolute inset-0 w-full h-full">
        <ModelViewer
          ref={viewerRef}
          src={resolveAssetUrl(product.arModelUrl)}
          alt={`AR view of ${product.name}`}
          shadow-intensity="1.5"
          shadow-softness="1"
          camera-controls
          auto-rotate
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-placement="floor"
          ar-scale="fixed"
          environment-image="neutral"
          exposure="1"
          loading="eager"
          reveal="auto"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto auto"
          max-camera-orbit="auto auto 150%"
          interaction-prompt="auto"
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Native AR slot button - hidden; we trigger via custom UI */}
          <button slot="ar-button" style={{ display: 'none' }} />
        </ModelViewer>
      </div>

      {/* --- Top Overlay Bar --- */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 pointer-events-none">
        <button
          onClick={handleBack}
          className="pointer-events-auto flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-4 py-2.5 rounded-full text-sm font-bold border border-white/10 hover:bg-black/60 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Reticle hint when not in active AR */}
        {!isARActive && (
          <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
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
      </div>

      {/* --- Center "Launch AR" Prompt (Pre-AR State) --- */}
      {!isARActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center pointer-events-auto">
            {/* Floor reticle animation */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-2 border-dashed border-white/40 rounded-full animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-3 border border-white/20 rounded-full" />
              <Crosshair className="absolute inset-0 m-auto w-8 h-8 text-white/80" />
            </div>
            <h2 className="text-white/90 text-lg font-bold mb-2 drop-shadow-lg">Ready to place in your room</h2>
            <p className="text-white/50 text-xs font-medium mb-6 max-w-[200px] mx-auto">Tap below to start AR. Point your camera at the floor and move slowly.</p>

            <button
              onClick={launchAR}
              className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-900/50 hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-3 mx-auto border border-indigo-400/30"
            >
              <Box className="w-6 h-6" />
              View in AR
            </button>
          </div>
        </div>
      )}

      {/* --- Bottom Product Overlay Sheet (Pokemon Go-style) --- */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
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
                {/* Base */}
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

              {isARActive ? (
                <button
                  onClick={handlePlace}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Placement
                </button>
              ) : (
                <button
                  onClick={launchAR}
                  className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-400/30"
                >
                  <Box className="w-4 h-4" />
                  View in AR
                </button>
              )}
            </div>

            {/* In-AR helper hint */}
            {isARActive && (
              <p className="text-center text-white/30 text-[10px] font-medium mt-3 uppercase tracking-widest">
                Drag to move &middot; Pinch to resize &middot; Two-finger rotate
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
