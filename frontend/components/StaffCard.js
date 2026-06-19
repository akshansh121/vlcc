import { useState } from 'react';
import Image from 'next/image';

export default function StaffCard({ member }) {
  const [imgError, setImgError] = useState(false);

  const specializations = Array.isArray(member.specialization)
    ? member.specialization
    : typeof member.specialization === 'string'
    ? member.specialization.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const initials = (member.name || '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-yellow-500/40 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-500/5 hover:scale-105">
      {/* Avatar */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <div className="w-24 h-24 rounded-full ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-900 overflow-hidden">
          {member.image_url && !imgError ? (
            <Image
              src={member.image_url}
              alt={member.name}
              fill
              className="object-cover rounded-full"
              onError={() => setImgError(true)}
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-700 to-yellow-900 flex items-center justify-center">
              <span className="text-white font-bold text-2xl select-none">{initials}</span>
            </div>
          )}
        </div>

        {/* Experience badge */}
        {member.experience && (
          <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-tight">
            {member.experience}yr{parseInt(member.experience) !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <h3 className="text-white font-bold text-lg leading-tight">{member.name}</h3>
        {member.designation && (
          <p className="text-yellow-400 text-sm font-medium mt-0.5">{member.designation}</p>
        )}
      </div>

      {/* Specializations */}
      {specializations.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-1">
          {specializations.map((tag, idx) => (
            <span
              key={idx}
              className="bg-gray-800 border border-gray-700 text-gray-300 text-xs px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
