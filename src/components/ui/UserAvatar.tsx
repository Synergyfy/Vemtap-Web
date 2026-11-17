import { useProfile } from '../../context/ProfileContext';

interface UserAvatarProps {
  /** Size and colour of the initials; the surrounding avatar circle keeps its own size and background. */
  textClassName?: string;
}

/**
 * Fills an existing avatar circle with the signed-in user's profile photo, or
 * their first and last initials when they have no photo.
 */
export function UserAvatar({ textClassName = 'text-on-primary text-[13px]' }: UserAvatarProps) {
  const { avatarUrl, initials, fullName } = useProfile();
  if (avatarUrl) {
    return <img alt={fullName ? `${fullName}'s profile photo` : 'Your profile photo'} className="w-full h-full rounded-full object-cover bg-surface-canvas" src={avatarUrl} />;
  }
  return (
    <span aria-hidden="true" className={`font-bold leading-none tracking-wide select-none ${textClassName}`}>
      {initials || 'U'}
    </span>
  );
}
