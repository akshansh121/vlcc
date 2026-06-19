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
      className={`group relative bg-dark-800 rounded-2xl overflow-hidden border border-dark-600 hover:border-gold-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10 flex flex-col ${onCardClick ? 'cursor-pointer' : ''}`}
    >
      {/* Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-dark-700 to-dark-800 flex-shrink-0">
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-dark-700 to-dark-800">
            <Sparkles className="w-12 h-12 text-gold-500/40" />
          </div>
        )}

        {/* Legibility overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent z-[1] pointer-events-none" />

        {/* Category badge */}
        {service.category_name && (
          <span className="absolute top-3 left-3 bg-dark-900/80 backdrop-blur-sm text-gold-500 border border-gold-500/30 text-xs font-bold px-2 py-1 rounded-full z-10">
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
        <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-1">
          {service.name}
        </h3>

        {service.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">
            {service.description}
          </p>
        )}

        {/* Duration */}
        {service.duration && (
          <div className="flex items-center gap-1 text-gold-500 text-sm mb-3">
            <Clock size={14} />
            <span>{service.duration} min</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-gold-500 font-bold text-xl">
            ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
          </span>
          {hasDiscount && (
            <span className="text-gray-500 text-sm line-through">
              ₹{parseFloat(service.original_price).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 disabled:bg-gold-700 disabled:cursor-not-allowed text-dark-900 font-semibold py-2.5 rounded-xl transition-colors duration-200 text-sm"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
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
