import { Icon } from './ui/Icon';
import type { ClusterBusinessMember } from '../scripts/clusterData';

interface ClusterMemberProfileModalProps {
  member: ClusterBusinessMember;
  onClose: () => void;
  onOpenChat: (member: ClusterBusinessMember) => void;
}

export function ClusterMemberProfileModal({
  member,
  onClose,
  onOpenChat,
}: ClusterMemberProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-surface-canvas rounded-3xl w-full max-w-lg overflow-hidden border border-border-subtle shadow-2xl flex flex-col max-h-[90vh]">
        {/* Banner */}
        <div className="relative h-36 bg-surface-container shrink-0">
          {member.bannerUrl ? (
            <img
              src={member.bannerUrl}
              alt={member.businessName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary to-blue-700 flex items-center justify-center">
              <Icon name="storefront" className="text-[48px] text-white/50" />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>

        {/* Header Details */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xl font-bold text-text-primary">{member.businessName}</h3>
                {member.isVerified && (
                  <Icon name="verified" className="text-[18px] text-primary" />
                )}
              </div>
              <p className="text-xs text-text-secondary mt-0.5">{member.unitOrSuite}</p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-surface-subtle text-text-secondary border border-border-subtle capitalize">
              {member.category}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onOpenChat(member)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary-container text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-all"
            >
              <Icon name="chat" className="text-[16px]" />
              <span>In-App Chat Merchant</span>
            </button>
            <a
              href={`tel:${member.phone}`}
              className="py-2.5 px-3 rounded-xl bg-surface-subtle border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Icon name="call" className="text-[16px] text-primary" />
              <span>Call</span>
            </a>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">About</h4>
            <p className="text-xs text-text-secondary leading-relaxed">{member.bio}</p>
          </div>

          {/* Operating Info Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-surface-subtle border border-border-subtle text-xs">
            <div>
              <p className="text-[11px] text-text-tertiary">Opening Hours</p>
              <p className="font-semibold text-text-primary mt-0.5">{member.hours}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-tertiary">Cluster Footfall</p>
              <p className="font-semibold text-text-primary mt-0.5">
                {member.scansContributed.toLocaleString()} scans contributed
              </p>
            </div>
          </div>

          {/* Top Offers in Cluster Pool */}
          {member.topOffers && member.topOffers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-tertiary">
                Active in Cluster Rotator Pool
              </h4>
              <div className="space-y-2">
                {member.topOffers.map((offer, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-canvas border border-border-subtle flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-text-primary">{offer.title}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">
                        ₦{offer.price.toLocaleString()}
                      </p>
                    </div>
                    {offer.discount && (
                      <span className="text-[10px] font-bold text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full">
                        {offer.discount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
