export default function LoadingSpinner({ label = '', size = 'md', fullScreen = false }) {
  const sizeMap = {
    sm: { outer: 'w-6 h-6', inner: 'w-4 h-4', text: 'text-xs' },
    md: { outer: 'w-10 h-10', inner: 'w-7 h-7', text: 'text-sm' },
    lg: { outer: 'w-16 h-16', inner: 'w-11 h-11', text: 'text-base' },
  };
  const s = sizeMap[size] || sizeMap.md;

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* Double-ring spinner */}
      <div className={`relative ${s.outer}`}>
        {/* Outer ring */}
        <span
          className={`absolute inset-0 rounded-full border-2 border-yellow-500/20`}
        />
        {/* Spinning arc */}
        <span
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-yellow-500 animate-spin`}
        />
        {/* Inner dot */}
        <span
          className={`absolute inset-0 flex items-center justify-center`}
        >
          <span className={`${s.inner} rounded-full bg-yellow-500/10 flex items-center justify-center`}>
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
          </span>
        </span>
      </div>

      {label && (
        <p className={`text-yellow-400 font-medium ${s.text} tracking-wide animate-pulse`}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
