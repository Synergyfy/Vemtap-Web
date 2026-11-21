import { CHANNEL_PLATFORMS, isChannelPlatform, type ChannelPlatformId } from './socialChannels';

/** An editable row for a single social/messaging channel on a business profile. */
export interface ProfileChannel {
  id: string;
  platform: ChannelPlatformId;
  value: string;
  touched: boolean;
}

/** Only channels with a saved value become rows — the picker decides what to add. */
export function channelsFromProfile(profile: {
  socials: Record<string, string>;
  whatsappNumber: string;
}): ProfileChannel[] {
  const channels: ProfileChannel[] = [];
  const push = (platform: ChannelPlatformId, value: string) => {
    if (value && !channels.some((channel) => channel.platform === platform)) {
      channels.push({ id: platform, platform, value, touched: false });
    }
  };

  Object.entries(profile.socials ?? {}).forEach(([platform, value]) => {
    if (isChannelPlatform(platform)) push(platform, String(value));
  });
  if (profile.whatsappNumber) push('whatsapp', profile.whatsappNumber);
  return channels;
}

/** Rebuild the saved shape from the rows the merchant actually added. */
export function socialFieldsFromChannels(
  channels: ProfileChannel[],
  base: { socials: Record<string, string> },
): { socials: Record<string, string>; whatsappNumber: string } {
  const socials = { ...(base.socials ?? {}) };
  CHANNEL_PLATFORMS.forEach((platform) => {
    delete socials[platform.id];
  });

  let whatsappNumber = '';
  channels.forEach((channel) => {
    const value = channel.value.trim();
    if (!value) return;
    if (channel.platform === 'whatsapp') whatsappNumber = value;
    else socials[channel.platform] = value;
  });

  return { socials, whatsappNumber };
}
