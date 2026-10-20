/**
 * VEMTAP AI Design Assistant — frontend-only prompt preparation.
 *
 * VEMTAP does not generate images and never calls a paid AI API. This module
 * simply assembles a tailored text prompt from business data the frontend
 * already holds (the in-flight onboarding draft via `businessSetup`, plus any
 * form state a screen passes in). The merchant copies the prompt into an
 * external provider (ChatGPT, Google Gemini), downloads the generated image
 * there, and uploads it through VEMTAP's existing upload flow.
 *
 * Rules honoured by every template:
 *  - Only include facts actually present in the frontend — never invent data.
 *  - Missing critical fields fall back to a generic instruction instead of
 *    asking the merchant to re-enter anything.
 *  - Target dimensions follow the existing upload components' aspect ratios
 *    and the specs already displayed on those screens.
 */
import { BUSINESS_CATEGORIES } from './businessOnboardingSeed';
import { getBusinessSetupSnapshot } from './businessSetup';

/** Asset the merchant is creating. Drives the label, template and aspect. */
export type AiAssetType = 'logo' | 'banner' | 'product' | 'service';

/** Mirrors the existing upload components' aspect-ratio options. */
export type AiImageAspect = '4/3' | '16/9' | 'square';

/**
 * Business/item facts available in the frontend. Every field is optional —
 * empty or whitespace-only values are ignored rather than invented.
 */
export interface AiPromptContext {
  businessName?: string;
  /** Human-readable category label(s), comma separated. */
  category?: string;
  subcategory?: string;
  location?: string;
  description?: string;
  /** Existing brand colours or brand identity notes, if the screen holds them. */
  brandColours?: string;
  /** Product/service title (product and service prompts only). */
  itemName?: string;
  /** Product/service description (product and service prompts only). */
  itemDescription?: string;
}

export interface AiPromptOptions {
  /** Defaults per asset type: logo/product → 1:1, banner → 16:9, service → 4/3. */
  aspectRatio?: AiImageAspect;
}

export interface AiProvider {
  id: 'chatgpt' | 'gemini';
  name: string;
  url: string;
}

/** External provider destinations. VEMTAP opens these in a new tab only. */
export const AI_PROVIDERS: readonly AiProvider[] = [
  { id: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com/' },
  { id: 'gemini', name: 'Google Gemini', url: 'https://gemini.google.com/' },
];

/** Modal heading chip — clearly identifies the asset being created. */
export const AI_ASSET_LABELS: Record<AiAssetType, string> = {
  logo: 'Logo',
  banner: 'Storefront Banner',
  product: 'Product Image',
  service: 'Service Image',
};

/** Contextual trigger copy shown next to the existing upload controls. */
export function aiTriggerLabel(assetType: AiAssetType): string {
  switch (assetType) {
    case 'logo':
      return "Don't have a logo? Create one with AI.";
    case 'banner':
      return "Don't have a banner? Create one with AI.";
    case 'product':
      return 'Need a product image? Create one with AI.';
    case 'service':
      return 'Need a service image? Create one with AI.';
  }
}

const DEFAULT_ASPECTS: Record<AiAssetType, AiImageAspect> = {
  logo: 'square',
  banner: '16/9',
  product: 'square',
  service: '4/3',
};

/**
 * Output sizes written into the prompts. The banner size matches the spec
 * already shown on the cover-banner upload ("1200 × 675px, 16:9"); the others
 * follow each upload component's displayed aspect ratio.
 */
const ASPECT_DIMENSIONS: Record<AiImageAspect, string> = {
  square: '1024 × 1024 pixels',
  '4/3': '1024 × 768 pixels',
  '16/9': '1280 × 720 pixels',
};
const BANNER_DIMENSIONS = '1200 × 675 pixels';

function clean(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const collapsed = value.replace(/\s+/g, ' ').trim();
  return collapsed.length > 0 ? collapsed : undefined;
}

/** Resolves stored category values (e.g. `restaurant`) to their labels. */
function resolveCategoryLabel(value: string): string {
  const match = BUSINESS_CATEGORIES.find(
    (option) => option.value === value || option.label === value,
  );
  return match ? match.label : value;
}

function resolveCategoryList(value: string | undefined): string | undefined {
  const text = clean(value);
  if (!text) return undefined;
  return text
    .split(',')
    .map((part) => resolveCategoryLabel(part.trim()))
    .filter((part) => part.length > 0)
    .join(', ');
}

/**
 * Business facts already held by the frontend's business-setup snapshot (the
 * same source `DesktopBusinessCatalogHubScreen` reads). Returns an empty
 * object outside setup — callers then fall back to what each screen passes.
 */
function snapshotBusinessContext(): AiPromptContext {
  const draft = getBusinessSetupSnapshot()?.data?.draft as Record<string, unknown> | undefined;
  if (!draft) return {};

  const text = (key: string): string | undefined => {
    const value = draft[key];
    return typeof value === 'string' ? clean(value) : undefined;
  };
  const list = (key: string): string | undefined => {
    const value = draft[key];
    if (!Array.isArray(value)) return undefined;
    const parts = value
      .filter((entry): entry is string => typeof entry === 'string')
      .map((entry) => clean(entry))
      .filter((entry): entry is string => Boolean(entry));
    return parts.length > 0 ? parts.join(', ') : undefined;
  };

  return {
    businessName: text('name'),
    category: resolveCategoryList(list('categories')),
    subcategory: list('tags'),
    description: text('description'),
  };
}

/** Merges explicit screen context over the snapshot, ignoring empty values. */
function resolveContext(context: AiPromptContext): AiPromptContext {
  const explicit: AiPromptContext = {};
  const fields = {
    businessName: clean(context.businessName),
    category: resolveCategoryList(context.category),
    subcategory: clean(context.subcategory),
    location: clean(context.location),
    description: clean(context.description),
    brandColours: clean(context.brandColours),
    itemName: clean(context.itemName),
    itemDescription: clean(context.itemDescription),
  } as const;
  (Object.keys(fields) as Array<keyof AiPromptContext>).forEach((key) => {
    const value = fields[key];
    if (value) explicit[key] = value;
  });
  return { ...snapshotBusinessContext(), ...explicit };
}

/** Business fact lines, included only when the value exists. */
function businessFactLines(context: AiPromptContext): string[] {
  const lines: string[] = [];
  if (context.businessName) lines.push(`Business name: ${context.businessName}`);
  if (context.category) lines.push(`Category: ${context.category}`);
  if (context.subcategory) lines.push(`Sub-category: ${context.subcategory}`);
  if (context.location) lines.push(`Location: ${context.location}`);
  if (context.description) lines.push(`Business summary: "${context.description}"`);
  if (context.brandColours) lines.push(`Brand colours / identity: ${context.brandColours}`);
  return lines;
}

/** Final guardrail shared by every template. */
const NO_GUESSING =
  'If any detail above is missing or uncertain, keep that aspect of the design neutral — do not guess facts about the business.';

function buildLogoPrompt(context: AiPromptContext, dimensions: string): string {
  const facts = businessFactLines(context);
  const lines = [
    'Design a professional logo for a digital storefront.',
    facts.length > 0
      ? facts.join('\n')
      : 'Business details are not available — design a clean, generic professional mark.',
    '',
    'Logo requirements:',
    '- A distinctive, professional visual identity that suits this business and its industry.',
    context.businessName
      ? '- Show the business name clearly, paired with one memorable visual concept.'
      : '- One clear, memorable visual concept.',
    '- A simple, uncluttered composition that stays recognisable at small sizes such as map pins, badges, and favicons.',
    '- A clean solid background with minimal clutter — no busy scenes or photographic textures.',
    '- No invented awards, certifications, ratings, testimonials, or other claims.',
    `- A square, high-resolution output of ${dimensions} where the provider supports it, suitable for a digital storefront.`,
  ];
  if (!context.businessName) {
    lines.push(
      '- The business name is not available: design a simple abstract mark with no embedded text instead of inventing a name.',
    );
  }
  lines.push(NO_GUESSING);
  return lines.join('\n');
}

function buildBannerPrompt(context: AiPromptContext): string {
  const facts = businessFactLines(context);
  return [
    'Create a wide storefront cover banner for a digital storefront.',
    facts.length > 0
      ? facts.join('\n')
      : 'Business details are not available — design a clean, generic banner layout.',
    '',
    'Banner requirements:',
    `- A wide 16:9 landscape composition — ${BANNER_DIMENSIONS} or 1920 × 1080 pixels (both 16:9), or the closest supported wide format.`,
    '- A professional, visually appealing design consistent with the business identity and suited to its category and intended customers.',
    '- Keep the main subject inside the frame with clear negative space, so interface overlays never cover key elements.',
    '- Place text only in safe areas, away from the edges; use the business name as the only text.',
    '- No fabricated contact details, discounts, addresses, offers, ratings, or business claims.',
    '- A clean finish with no watermarks, stock logos, or busy collages.',
    NO_GUESSING,
  ].join('\n');
}

function buildItemPrompt(
  assetType: 'product' | 'service',
  context: AiPromptContext,
  dimensions: string,
): string {
  const noun = assetType === 'product' ? 'product' : 'service';
  const facts: string[] = [];
  if (context.itemName) facts.push(`Item name: ${context.itemName}`);
  if (context.itemDescription) facts.push(`Item description: "${context.itemDescription}"`);
  facts.push(...businessFactLines(context));

  const lines = [
    `Create an image of a ${noun} offered on a digital storefront.`,
    facts.length > 0
      ? facts.join('\n')
      : 'Item details are not available — use a clean, generic presentation for the item.',
    '',
    'Image requirements:',
    `- A clear, professional composition suited to a storefront ${noun} card, output at ${dimensions} (or the closest supported size).`,
    `- Base the image only on the ${noun} details supplied above. Do not invent features, packaging, ingredients, prices, certifications, or claims.`,
    '- Where the exact appearance of the real item is unknown, create a clean illustrative concept rather than an accurate representation of the actual item.',
    '- Use accurate real photography instead whenever showing the true appearance of the item matters.',
  ];
  if (!context.itemName) {
    lines.push(`- Do not invent a ${noun} name; keep the presentation simple and generic.`);
  }
  lines.push(NO_GUESSING);
  return lines.join('\n');
}

/**
 * Builds the tailored prompt for the selected asset type from whatever
 * business data is actually available (screen context + setup snapshot).
 * Never throws on missing fields.
 */
export function buildAiPrompt(
  assetType: AiAssetType,
  context: AiPromptContext = {},
  options: AiPromptOptions = {},
): string {
  const resolved = resolveContext(context);
  const aspect = options.aspectRatio ?? DEFAULT_ASPECTS[assetType];
  const dimensions = ASPECT_DIMENSIONS[aspect];

  switch (assetType) {
    case 'logo':
      return buildLogoPrompt(resolved, dimensions);
    case 'banner':
      return buildBannerPrompt(resolved);
    case 'product':
      return buildItemPrompt('product', resolved, dimensions);
    case 'service':
      return buildItemPrompt('service', resolved, dimensions);
  }
}


