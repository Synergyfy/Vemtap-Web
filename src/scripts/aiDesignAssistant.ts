/**
 * VEMTAP AI Design Assistant — frontend-only prompt preparation.
 *
 * VEMTAP does not generate images or copy and never calls a paid AI API. This
 * module simply assembles a tailored text prompt from business data the
 * frontend already holds (the in-flight onboarding draft via `businessSetup`,
 * plus any form state a screen passes in). The merchant copies the prompt into
 * an external provider (ChatGPT, Google Gemini), then either downloads the
 * generated image and uploads it through VEMTAP's existing upload flow, or
 * copies the generated storefront description into its existing text field.
 *
 * Rules honoured by every template:
 *  - Only include facts actually present in the frontend — never invent data.
 *  - Missing critical fields fall back to a generic instruction instead of
 *    asking the merchant to re-enter anything.
 *  - Target dimensions follow the existing upload components' aspect ratios
 *    and the specs already displayed on those screens.
 *  - Description prompts are capped at the Storefront Description field's
 *    250-character limit.
 */
import { BUSINESS_CATEGORIES } from './businessOnboardingSeed';
import { getBusinessSetupSnapshot } from './businessSetup';
import type { DealAiPromptData } from './deals/dealStudioShared';

/** Asset the merchant is creating. Drives the label, template and aspect. */
export type AiAssetType =
  | 'logo'
  | 'banner'
  | 'product'
  | 'service'
  | 'description'
  | 'deal-image'
  | 'deal-video';

/** Mirrors the existing upload components' aspect-ratio options. */
export type AiImageAspect = '4/3' | '16/9' | 'square' | '9/16';

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
  /** Product/service brand or producer name (product and service prompts only). */
  brand?: string;
  /** Product/service description (product and service prompts only). */
  itemDescription?: string;
  /** Verified Deal Studio facts, built from the in-flight draft (deal prompts only). */
  deal?: DealAiPromptData;
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
  description: 'Storefront Description',
  'deal-image': 'Deal Image',
  'deal-video': 'Deal Video',
};

/** Contextual trigger copy shown next to the existing upload/text controls. */
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
    case 'description':
      return 'Write your Description with AI';
    case 'deal-image':
      return 'Generate Deal Image with AI';
    case 'deal-video':
      return 'Generate Deal Video with AI';
  }
}

const DEFAULT_ASPECTS: Record<AiAssetType, AiImageAspect> = {
  logo: 'square',
  banner: '16/9',
  product: 'square',
  service: '4/3',
  // Descriptions are text: an aspect ratio is never used for this template.
  description: 'square',
  'deal-image': 'square',
  'deal-video': '9/16',
};

/** Matches the Storefront Description textarea's `maxLength` in both views. */
export const DESCRIPTION_MAX_CHARS = 250;

/**
 * Output sizes written into the prompts. The banner size matches the spec
 * already shown on the cover-banner upload ("1200 × 675px, 16:9"); the others
 * follow each upload component's displayed aspect ratio.
 */
const ASPECT_DIMENSIONS: Record<AiImageAspect, string> = {
  square: '1024 × 1024 pixels',
  '4/3': '1024 × 768 pixels',
  '16/9': '1280 × 720 pixels',
  '9/16': '1080 × 1920 pixels',
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
  type ContextField = Exclude<keyof AiPromptContext, 'deal'>;
  const fields: Record<ContextField, string | undefined> = {
    businessName: clean(context.businessName),
    category: resolveCategoryList(context.category),
    subcategory: clean(context.subcategory),
    location: clean(context.location),
    description: clean(context.description),
    brandColours: clean(context.brandColours),
    itemName: clean(context.itemName),
    brand: clean(context.brand),
    itemDescription: clean(context.itemDescription),
  };
  (Object.keys(fields) as ContextField[]).forEach((key) => {
    const value = fields[key];
    if (value) explicit[key] = value;
  });
  return {
    ...snapshotBusinessContext(),
    ...explicit,
    ...(context.deal ? { deal: context.deal } : {}),
  };
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
  if (context.brand) facts.push(`Brand: ${context.brand}`);
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
 * Storefront description template. The merchant pastes the provider's answer
 * into the existing description textarea, so the prompt asks for plain text
 * only and repeats the field's character limit as a hard constraint.
 */
function buildDescriptionPrompt(context: AiPromptContext): string {
  const facts: string[] = [];
  if (context.businessName) facts.push(`Business name: ${context.businessName}`);
  if (context.category) facts.push(`Business category: ${context.category}`);
  if (context.subcategory) facts.push(`Subcategories / specialties: ${context.subcategory}`);

  return [
    'Write a short storefront description for a local business, using only the details below.',
    facts.length > 0
      ? facts.join('\n')
      : 'Business details are not available yet — write a short, generic welcome message without naming anything unverified.',
    '',
    'Description requirements:',
    `- Keep the answer under ${DESCRIPTION_MAX_CHARS} characters including spaces — the storefront field accepts ${DESCRIPTION_MAX_CHARS} characters at most.`,
    '- Use friendly, plain language that helps nearby shoppers understand what the business offers.',
    '- Weave the business name, category and selected specialties into 1–2 natural sentences instead of listing them.',
    '- Return only the finished description: no heading, no quotation marks, no explanations and no character count.',
    '- Do not invent products, services, prices, addresses, opening hours, ratings, awards or certifications.',
    NO_GUESSING,
  ].join('\n');
}

/** Deal facts are always taken from the merchant's own draft, never invented. */
function dealFactLines(deal: DealAiPromptData | undefined): string[] {
  if (!deal) return ['Deal details are not available yet — keep the design generic.'];
  const lines = [
    `Deal title: ${deal.title}`,
    `Deal structure: ${deal.structure}`,
  ];
  if (deal.description) lines.push(`Deal description: "${deal.description}"`);
  if (deal.products.length) {
    lines.push(
      ...deal.products.map(
        (product) => `Deal product: ${product.name} — ₦${product.price.toLocaleString('en-NG')}`,
      ),
    );
  }
  lines.push(...deal.offerLines.map((line) => `Offer: ${line}`));
  if (deal.startDate || deal.endDate) {
    lines.push(`Valid: ${deal.startDate || 'not set'} → ${deal.endDate || 'not set'}`);
  }
  lines.push(`Deal quantity: ${deal.quantity}`);
  if (deal.branches.length) lines.push(`Running at: ${deal.branches.join(', ')}`);
  return lines;
}

function buildDealImagePrompt(context: AiPromptContext, dimensions: string): string {
  const facts = [
    ...businessFactLines(context),
    ...dealFactLines(context.deal),
  ];
  return [
    'Create a promotional image for a customer-facing deal on a digital storefront.',
    'Use only these verified facts about the business and the deal:',
    ...facts,
    '',
    'Image requirements:',
    `- A clean, trustworthy square storefront/social promotional image, output at ${dimensions} (or the closest supported size).`,
    '- Make the deal title and the customer price the visual focus if text is included; use only the exact words and figures supplied above.',
    '- Show the selected products accurately when their appearance is known. Do not invent packaging, ingredients, features, discounts, awards, certifications or customer claims.',
    '- Keep text large and readable, with generous spacing and no clutter.',
    '- No watermarks, stock logos, fabricated ratings, testimonials or unverified claims.',
    NO_GUESSING,
  ].join('\n');
}

function buildDealVideoPrompt(context: AiPromptContext, dimensions: string): string {
  const facts = [
    ...businessFactLines(context),
    ...dealFactLines(context.deal),
  ];
  return [
    'Create a short promotional video for a customer-facing deal on a digital storefront.',
    'Use only these verified facts about the business and the deal:',
    ...facts,
    '',
    'Video requirements:',
    `- A 6–8 second vertical video at ${dimensions} (or the closest supported format), suitable for a storefront deal gallery.`,
    '- Smooth, simple motion focused on the selected products and the deal price; keep the first frame readable as a thumbnail.',
    '- If on-screen text is used, show only the deal title and price facts supplied above, large enough to read on a phone.',
    '- Do not invent sounds, voices, packaging, ingredients, features, awards, certifications or customer claims. Silent output is preferred.',
    '- No watermarks, stock logos, fabricated ratings, testimonials or unverified claims.',
    '- Export a compressed MP4 suitable for upload (keep it under 5MB where the provider allows).',
    NO_GUESSING,
  ].join('\n');
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
    case 'description':
      return buildDescriptionPrompt(resolved);
    case 'deal-image':
      return buildDealImagePrompt(resolved, dimensions);
    case 'deal-video':
      return buildDealVideoPrompt(resolved, dimensions);
  }
}


