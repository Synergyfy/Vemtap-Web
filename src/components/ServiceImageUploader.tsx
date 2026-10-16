import { useRef } from 'react';
import { Icon } from './ui/Icon';

export const SERVICE_PRESET_GALLERY = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5kJCcN5hfN4CHAyjM9ztBajNRH9N3SkL38ksjE3AyoelX4MEYejaPFoGwctYS266qyorIoQKcWEmZNs7Q5kgsygotoz2TJKsdyOZYsKcGnxlqAEEA6v2xVfV-oWp54srCsfwKZnaL4Xke7K7ZfNfVhgRqlpp7nIUNRt-iHDnIJxgjld79QZmEiqRPpWOQJ6NN-L-WTDKk9tyaTUh62Bs2W5DGAuGcrqcwBfQezAWCYT5AF74uuP4PBg',
    alt: 'Serene luxury spa aesthetic treatment room with warm ambient backlighting',
    label: 'Spa Sanctuary',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRT0JQg87G9GpBxmx2LkeUI6CVnJYmoSzQkXqIfpXgrEHHK-8SRiJ6rD8DLL7wUTzIU_W7JZH0Zfctt_2QFYSHy3FVQhZjp29LOim6qzQqQsIWVDtxIOwpCiOnvR4L6Nr8Mvsm6CUgbuiTSefV96fF9xBR4EBcOrUB-vQuigJdrV7EnEw3NosjORfttKVk5hqtAGK6SuaGbV3m5X7Sjsy4owvD8Ymt8DolSWp3nfU08hLvk97VNm6RfA',
    alt: 'Close up shot of aesthetic facial cleansing application with gentle foaming bubbles',
    label: 'Facial Cleansing',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtmwhvUUzD_ewKDmRA7m2RX9FD_aCLK1mv9J6RIZYxdp48G05Oo9CRs5k20Al-7eNX4KhPSR3NzayISpP6-r4_7rjXDG26tpyKYdSyWO9PdNtiDpCpcwfTvGjaz_tFELxleutDcQh7ZCjt5SOkkP32s9Y-6DQg43OIo1-zEK46FVL65J-_xp8qAlen7Zeb4E0bl3WbVua18bMh0O1xqkA1Hb4M2Lz88hW52Pad1MUSMKqP6QYEElbSQ',
    alt: 'Aesthetic cosmetic glass droppers with amber liquid botanical hydrating facial serum',
    label: 'Botanical Infusion',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6zBmPpSqLRhs0pmUGVti6x3UYkA-lYXmXV18ADSgilBGs30Z9VXlA4W9epW6Rem-X7KENLu3sRHxz7QfQoNiokDvylgXO_G37r6MC7iUCWk0hYzp18QwE-X5FC148oP7-6NlJdQBhNN6E8tekaeQbFfkSicnNEU17PDPBAE4DA74ecJ6n6HUbpFx0zt6RDjE8hfy_TFLKUG62Ibn8EZtGakkD7861AV82uIgLrTgD-uC4CvkFxlhf7w',
    alt: 'Gentle relaxing facial jade roller massage on smooth glowing skin',
    label: 'Jade Sculpting',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4wRhk7Z2awcljAxG1LjsDB3N2bAN7rQlDkEXDILlYF6i09D_DE0_JDmPFddvIXLKfZ-TtuSypTz0Kl3jUy7knUpU3HB4NuSb137foMDpgotXoiK7w3GVbU1FRlvDkCRSfNt7lLHtinSDkQaVQwt40lHDAj3DUxzf9tBWYtOf7qlTY-_mE9_3gDNIH9wVJF72-OJb0k0sqg-vLThSLsh7dq90yBqvw9fzIB1gXV-Fo2ZXSueR6oLefog',
    alt: 'Minimalist linen draped massage suite in high dynamic range',
    label: 'Wellness Suite',
  },
];

interface ServiceImageUploaderProps {
  currentImage: string;
  onImageChange: (imageUrl: string) => void;
  aspectRatio?: '4/3' | '16/9' | 'square';
}

export function ServiceImageUploader({
  currentImage,
  onImageChange,
  aspectRatio = '4/3',
}: ServiceImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onImageChange(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if desired
    e.target.value = '';
  };

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : 'aspect-[4/3]';

  return (
    <div className="flex flex-col gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Main Preview Box */}
      <div className={`relative w-full ${aspectClass} rounded-2xl overflow-hidden shadow-sm bg-surface-container-high group border border-outline/10`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Service cover preview"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-text-tertiary">
            <Icon name="add_photo_alternate" className="text-[48px]" />
            <span className="font-label-md text-label-md">No image selected</span>
          </div>
        )}

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-scrim/75 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm text-white">
            <Icon className="text-[14px] text-tertiary-fixed" filled name="star" />
            <span className="font-label-sm text-label-sm font-medium">Cover Photo</span>
          </div>
          <span className="font-caption text-caption bg-surface-canvas/90 backdrop-blur-md px-2.5 py-1 rounded-full text-text-secondary font-medium">
            Active on Storefront
          </span>
        </div>

        {/* Floating Bottom Actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-surface-canvas/95 hover:bg-surface-canvas active:scale-95 text-text-primary px-3.5 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-all font-button-secondary text-button-secondary font-semibold"
          >
            <Icon className="text-[18px] text-primary" name="file_upload" />
            <span>{currentImage ? 'Replace Photo' : 'Upload Photo'}</span>
          </button>
        </div>
      </div>

      {/* Preset Gallery Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-caption text-caption text-text-secondary font-medium">
            Or choose a photo from your curated catalog library:
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="font-caption text-caption text-primary hover:underline font-semibold flex items-center gap-1"
          >
            <Icon name="upload" className="text-[14px]" />
            <span>Upload custom</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {SERVICE_PRESET_GALLERY.map((preset, index) => {
            const isSelected = currentImage === preset.src;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onImageChange(preset.src)}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                  isSelected
                    ? 'border-primary shadow-sm ring-2 ring-primary/30 scale-102'
                    : 'border-transparent hover:border-outline/40 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={preset.src}
                  alt={preset.alt}
                  className="w-full h-full object-cover"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                      <Icon name="check" className="text-[14px]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
