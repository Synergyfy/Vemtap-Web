export type VerificationIdType = 'nin' | 'drivers_license' | 'passport' | 'voters_card';

export type CacEntityType = 'BN' | 'RC' | 'IT';

export interface VerificationDraft {
  idType: VerificationIdType;
  idNumber: string;
  legalName: string;
  dateOfBirth: string;
  cacRegistered: boolean;
  entity: CacEntityType | '';
  cacNumber: string;
  businessName: string;
}

export interface VerificationIdTypeConfig {
  key: VerificationIdType;
  optionName: string;
  icon: string;
  badge: string | null;
  optionDescription: string;
  pill: string;
  heading: string;
  fieldLabel: string;
  counter: string;
  placeholder: string;
  inputMode: 'numeric' | 'text';
  helperLead: string;
  helperStrong: string;
  helperTail: string;
  uploadTitle: string;
  uploadCaption: string;
  uploadAction: string;
  fileName: string;
  submitLabel: string;
  loadingLabel: string;
  infoTitle: string;
  infoBody: string;
  documentLabel: string;
  maxLength: number;
  normalize: (value: string) => string;
  format: (raw: string) => string;
  isValid: (raw: string) => boolean;
}

const normalizeDigits = (value: string, max: number) => value.replace(/\D/g, '').substring(0, max);

const normalizeCode = (value: string, max: number) =>
  value
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .substring(0, max);

const formatNin = (raw: string) => {
  if (raw.length <= 4) return raw;
  if (raw.length <= 8) return `${raw.slice(0, 4)} ${raw.slice(4)}`;
  return `${raw.slice(0, 4)} ${raw.slice(4, 8)} ${raw.slice(8)}`;
};

export const ID_TYPE_CONFIG: Record<VerificationIdType, VerificationIdTypeConfig> = {
  nin: {
    key: 'nin',
    optionName: 'NIN',
    icon: 'fingerprint',
    badge: 'Recommended • Instant',
    optionDescription: 'Fast digital verification via official NIMC database',
    pill: 'NIN Verification',
    heading: 'Enter your NIN details',
    fieldLabel: 'National Identification Number (NIN)',
    counter: '11 digits',
    placeholder: 'e.g. 5041 2938 104',
    inputMode: 'numeric',
    helperLead: 'Dial ',
    helperStrong: '*346#',
    helperTail: ' on your registered SIM to retrieve your NIN.',
    uploadTitle: 'Upload or Snap Slip / Card',
    uploadCaption: 'Make sure the document is clear, well-lit, and all 4 corners are visible.',
    uploadAction: 'Take Photo or Upload Slip',
    fileName: 'nin_slip_scan.jpg',
    submitLabel: 'Verify Identity',
    loadingLabel: 'Verifying NIN with NIMC...',
    infoTitle: 'About NIN Verification',
    infoBody: 'Your 11-digit NIN is issued by NIMC. We validate your name against government registries for compliance.',
    documentLabel: 'National ID (NIN)',
    maxLength: 11,
    normalize: (value) => normalizeDigits(value, 11),
    format: formatNin,
    isValid: (raw) => raw.length === 11,
  },
  drivers_license: {
    key: 'drivers_license',
    optionName: "Driver's Licence",
    icon: 'directions_car',
    badge: null,
    optionDescription: 'Federal Road Safety Corps (FRSC) issued licence',
    pill: 'Licence Verification',
    heading: "Enter your driver's licence details",
    fieldLabel: "Driver's Licence Number",
    counter: 'As printed on card',
    placeholder: 'e.g. ABC-123-456-789',
    inputMode: 'text',
    helperLead: 'Your licence number is printed on the front of your ',
    helperStrong: 'FRSC licence card',
    helperTail: '.',
    uploadTitle: 'Upload or Snap Licence Card',
    uploadCaption: 'Make sure the card is clear, well-lit, and all 4 corners are visible.',
    uploadAction: 'Take Photo or Upload Licence',
    fileName: 'drivers_licence_scan.jpg',
    submitLabel: 'Verify Identity',
    loadingLabel: 'Verifying licence with FRSC...',
    infoTitle: 'About Licence Verification',
    infoBody:
      "Your driver's licence is issued by the FRSC. We validate your name against the federal licensing registry for compliance.",
    documentLabel: "Driver's Licence (FRSC)",
    maxLength: 15,
    normalize: (value) => normalizeCode(value, 15),
    format: (raw) => raw,
    isValid: (raw) => raw.length >= 10,
  },
  passport: {
    key: 'passport',
    optionName: 'International Passport',
    icon: 'menu_book',
    badge: null,
    optionDescription: 'Nigerian Immigration Service (NIS) passport',
    pill: 'Passport Verification',
    heading: 'Enter your passport details',
    fieldLabel: 'International Passport Number',
    counter: 'As on photo page',
    placeholder: 'e.g. A08123456',
    inputMode: 'text',
    helperLead: 'Your passport number is printed on the ',
    helperStrong: 'photo page',
    helperTail: ' of your NIS-issued passport.',
    uploadTitle: 'Upload or Snap Passport Bio Page',
    uploadCaption: 'Make sure the page is clear, well-lit, and all 4 corners are visible.',
    uploadAction: 'Take Photo or Upload Passport',
    fileName: 'passport_bio_page.jpg',
    submitLabel: 'Verify Identity',
    loadingLabel: 'Verifying passport with NIS...',
    infoTitle: 'About Passport Verification',
    infoBody:
      'Your passport is issued by the Nigerian Immigration Service. We validate your name against the NIS registry for compliance.',
    documentLabel: 'International Passport (NIS)',
    maxLength: 9,
    normalize: (value) => normalizeCode(value, 9),
    format: (raw) => raw,
    isValid: (raw) => raw.length >= 8,
  },
  voters_card: {
    key: 'voters_card',
    optionName: "Voter's Card",
    icon: 'how_to_vote',
    badge: null,
    optionDescription: 'Official INEC voter registry lookup via 19-character Voter Identification Number',
    pill: 'Voter Registry Verification',
    heading: "Enter your voter's card details",
    fieldLabel: 'Voter Identification Number (VIN)',
    counter: '19 characters',
    placeholder: 'e.g. 90F3A5B1C2D3E4F5G6H',
    inputMode: 'text',
    helperLead: 'Your VIN is printed on the ',
    helperStrong: 'Permanent Voter Card (PVC)',
    helperTail: ' issued by INEC.',
    uploadTitle: 'Upload or Snap Voter Card',
    uploadCaption: 'Make sure the card is clear, well-lit, and all 4 corners are visible.',
    uploadAction: 'Take Photo or Upload PVC',
    fileName: 'voters_card_scan.jpg',
    submitLabel: 'Verify Identity',
    loadingLabel: 'Verifying VIN with INEC registry...',
    infoTitle: "About Voter's Card Verification",
    infoBody:
      'Your voter identification number is issued by INEC. We validate your name against the official voter registry for compliance.',
    documentLabel: "Voter's Card (INEC)",
    maxLength: 19,
    normalize: (value) => normalizeCode(value, 19),
    format: (raw) => raw,
    isValid: (raw) => raw.length >= 19,
  },
};

export const DEFAULT_ID_NUMBERS: Record<VerificationIdType, string> = {
  nin: '5041 2938 104',
  drivers_license: 'ABC123456789',
  passport: 'A08123456',
  voters_card: '90F3A5B1C2D3E4F5G6H',
};

export const INITIAL_VERIFICATION_DRAFT: VerificationDraft = {
  idType: 'nin',
  idNumber: DEFAULT_ID_NUMBERS.nin,
  legalName: 'Zainab Ahmed',
  dateOfBirth: '14 / 08 / 1989',
  cacRegistered: true,
  entity: 'BN',
  cacNumber: 'BN-3491820',
  businessName: 'Urban Grill & Bistro Ltd',
};

export const isFailedVerificationAttempt = (raw: string) => raw.length > 0 && /^0+$/.test(raw);
