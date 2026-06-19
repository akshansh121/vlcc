import { Check, Scissors } from 'lucide-react';

const PACKAGE_META = {
  silver: { icon: '⚪', label: 'Silver', color: 'text-gray-300', border: 'border-gray-500/40', glow: '' },
  gold: {
    icon: '⭐',
    label: 'Gold',
    color: 'text-yellow-400',
    border: 'border-yellow-500/60',
    glow: 'shadow-2xl shadow-yellow-500/25',
  },
  platinum: {
    icon: '👑',
    label: 'Platinum',
    color: 'text-purple-400',
    border: 'border-purple-500/50',
    glow: '',
  },
};

export default function PackageCard({ pkg, isHighlighted = false }) {
  const tier = (pkg.tier || pkg.type || 'silver').toLowerCase();
  const meta = PACKAGE_META[tier] || PACKAGE_META.silver;

  const benefits = Array.isArray(pkg.benefits)
    ? pkg.benefits
    : typeof pkg.benefits === 'string'
    ? pkg.benefits.split(',').map((b) => b.trim()).filter(Boolean)
    : [];

  const includedServices = Array.isArray(pkg.services)
    ? pkg.services
    : Array.isArray(pkg.included_services)
    ? pkg.included_services
    : [];

  const hasDiscount =
    pkg.discounted_price &&
    pkg.original_price &&
    parseFloat(pkg.discounted_price) < parseFloat(pkg.original_price);

  const displayPrice = hasDiscount ? pkg.discounted_price : pkg.original_price;

  return (
    <div
      className={`relative bg-gray-900 rounded-2xl border ${meta.border} ${
        isHighlighted ? meta.glow : ''
      } p-6 flex flex-col gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
          Most Popular
        </span>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{meta.icon}</span>
        <div>
          <h3 className={`font-bold text-xl ${meta.color}`}>{pkg.name}</h3>
          {pkg.description && (
            <p className="text-gray-400 text-sm mt-0.5 line-clamp-2">{pkg.description}</p>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2">
        <span className={`font-bold text-3xl ${meta.color}`}>
          ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
        </span>
        {hasDiscount && (
          <span className="text-gray-500 text-base line-through">
            ₹{parseFloat(pkg.original_price).toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Benefits */}
      {benefits.length > 0 && (
        <ul className="space-y-2">
          {benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
              <Check size={15} className={`mt-0.5 flex-shrink-0 ${meta.color}`} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Included services */}
      {includedServices.length > 0 && (
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 font-semibold">
            Included Services
          </p>
          <div className="flex flex-wrap gap-1.5">
            {includedServices.map((svc, idx) => {
              const name = typeof svc === 'string' ? svc : svc.name || svc.service_name || '';
              return (
                <span
                  key={idx}
                  className="flex items-center gap-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full"
                >
                  <Scissors size={10} className="flex-shrink-0" />
                  {name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm transition-colors duration-200 ${
          isHighlighted
            ? 'bg-yellow-500 hover:bg-yellow-400 text-black'
            : 'border border-gray-600 hover:border-yellow-500 text-gray-200 hover:text-yellow-400'
        }`}
      >
        Book This Package
      </button>
    </div>
  );
}
