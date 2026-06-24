import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Clock, Edit, Trash2, Eye, Sparkles } from 'lucide-react';

export default function ServiceCard({
  service,
  onAddToCart,
  onCardClick,
  showAdminActions = false,
  onEdit,
  onDelete,
}) {
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!onAddToCart) return;
    setLoading(true);
    try {
      await onAddToCart(service);
    } finally {
      setLoading(false);
    }
  };

  const hasDiscount =
    service.discounted_price &&
    service.original_price &&
    parseFloat(service.discounted_price) < parseFloat(service.original_price);

  const displayPrice = hasDiscount ? service.discounted_price : service.original_price;

  return (
    <div
      onClick={() => onCardClick && onCardClick(service)}
      className={`group relative glass-panel-interactive rounded-2xl overflow-hidden flex flex-col ${onCardClick ? 'cursor-pointer' : ''}`}
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-rose-100 to-pink-50 flex-shrink-0">
        {service.image_url && !imgError ? (
          <Image
            src={service.image_url}
            alt={service.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-50">
            <Sparkles className="w-12 h-12 text-rose-400/40" />
          </div>
        )}

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-rose-950/30 to-transparent z-[1] pointer-events-none" />

        {/* Category badge */}
        {service.category_name && (
          <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-rose-700 border border-rose-200/60 text-xs font-bold px-2 py-1 rounded-full z-10">
            {service.category_name}
          </span>
        )}

        {/* View details overlay on hover */}
        {onCardClick && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full">
              <Eye size={15} />
              View Details
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-rose-950 font-semibold text-lg leading-tight mb-1 line-clamp-1">
          {service.name}
        </h3>

        {service.description && (
          <p className="text-rose-700 text-sm leading-relaxed line-clamp-2 mb-3 flex-1 font-light">
            {service.description}
          </p>
        )}

        {/* Duration */}
        {service.duration && (
          <div className="flex items-center gap-1 text-rose-500 text-sm mb-3">
            <Clock size={14} />
            <span>{service.duration} min</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-rose-600 font-bold text-xl">
            ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-rose-400 text-sm line-through">
              ₹{parseFloat(service.original_price).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm shadow-rose-500/15"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ShoppingCart size={16} />
          )}
          {loading ? 'Adding…' : 'Add to Cart'}
        </button>

        {/* Admin actions */}
        {showAdminActions && (
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit && onEdit(service); }}
              className="flex-1 flex items-center justify-center gap-1 border border-blue-500 text-blue-400 hover:bg-blue-500/10 py-2 rounded-xl text-sm transition-colors duration-200"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete && onDelete(service); }}
              className="flex-1 flex items-center justify-center gap-1 border border-red-500 text-red-400 hover:bg-red-500/10 py-2 rounded-xl text-sm transition-colors duration-200"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
