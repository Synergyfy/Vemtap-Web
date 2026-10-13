export interface PublicCartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  image: string;
}

const IMG_BASE = 'https://lh3.googleusercontent.com/aida-public/';

export const PUBLIC_IMAGES = {
  hero: `${IMG_BASE}AB6AXuC8melsfUzPoOMFESZIkBD0ET4cFmEiVUNK9jNjMA-NUXPSO3cKcoCmXWcv8GfBRHSq0gJyyXHuI1H1XR6E6u5svIC6N9FmqNNtekvieQBbIIz0l2xEqcCdTJAZbyqj7dq90l_IkqKV2hmFUZStTe4qLFuOoguwqCzJLiAyKq-ohwtjJeWhSG7Z_6WkIcanQRZMdlgMDuHLbpXG3-6JzB-AuzPE_ntcyDj7-hlV2RgbfqebOJObKFaMWg`,
  logo: `${IMG_BASE}AB6AXuC7lDUQ2_JmLjOEYGxb0sHtwXCWTGMHk2gkbWNpBNuY6ZAJp_LI-VVdO4Q-R9A_omS1Y0Rs3mbjg3Kj6l2725l9nJrGAC99LriXPD_dB42iN8VusmegJG0kmP0LKmmfoK7d2y6oNvTRPTXynlwqImZtQpXwa1mjMIQUeyC7yIBua_2M8wPUqZ4PeVf1KVnDRvFSAVcvO_lmxEddrm9Gz_jCjgScpnEPO_GXxynq04tWj2SY2uJHZ14qLQ`,
  ribeye: `${IMG_BASE}AB6AXuDZB1h8Ab7AbFgQ2KgfXRi_I26mmE-4QT5IOrODTo2uzdvVuOhZ-XQeY8MN_-mKWJbrNtNQh3FMPz0fEFScD1rWTK2I9ltmCUStrda7ZNZT6Ri5wnXUxIe_hdJZOIGbsmKexXVBDEoW8xaUSVcSR1zoXKqQxAhl5TZhgNtObBXQhAULmTt_C5Vp7k_SG0tWnPJ9UwTYwHWrl0mx5JCIlLI9Ro0gw73WSGWnQBn6oOreiB_pLrHtZRfeUw`,
  combo: `${IMG_BASE}AB6AXuADmfWIxbuI7yoIILm58_oxdjKgVsVuUbL6PIqnPvEEhG3Sdqhiu1ruo07sva1zd3TS-rZkrYa4GYyWTR493eKuKgtbPO0l9KzEnny_9CqAoNXJY5d0pVsNxpjCccC4dSRnBjzgB7MqHL7eEMjWmqRkGxRb5vlj5zY_D1B1bKGTlVrlXstJLa1zE8gP7QVyGD3oTR1riJS6mhBEvcOEmEb3tbnP3kURN9keRNhqCgesBnR5iTbmWWrmnQ`,
  burger: `${IMG_BASE}AB6AXuAPh2Yfv4cEH6W4GBnJXQQbwtYk7V-UQw9RsKq1urBy0VQ0YGVd7alx6TVtPnXmq7ujUBYaQmwY3NdgpQzOX5TpoyKyo6up-F9WGSu5EpIOy7Iu6ttC6YIvVv4U1TepnoYdLM8kJtgPeQgm8W8dWKY0ndANZSPpeuun-1VfdzuSwWcCy6P2S19fDn3oex816PloCYAFRjObYpugLG-R9bWLsUruHBLt3UbomnwxKzZp7paXjWIxVJyJmQ`,
  wings: `${IMG_BASE}AB6AXuDlQfDuGa36dy_85OCT32uFvG8stILd18lE_fUnr5laIqAbnyRklD18rvcJYQmE_zQa1oFODeLbtxbga4GkehDKkBPb1DfeWVom84j66lxX3_v5L0MapxRhNgLdS984uFwDJZbTOleloA5F4CC1EiXG_MRuC-pwwT-x9OLib-vCotDBjgIW2UrsZ_iljJcyx0Z5QQjkDDjxzsI52zQFN4Ch_MW3Qz2gxaiKvDk1v4-tzvBeVsvLfMxd1g`,
  fries: `${IMG_BASE}AB6AXuDKxfXFkJzKs-TiwEbhoCFk3sd8rnHdshIlDoRLDvOenaMXkIU3vjfiHUe8_qNoELvNc6nt9rcVNh0aVjLKx7au85skwZIrfUu715YrDZrtSRn3kqh5TDVjlmeRJu1JJU4aBnKjRituLLjWjfbDFLBPfCSL2C1SX6cXqd71KcvR95DRdP_xIw3pdJIQ0pUIxYiGs62FD7FIX-iG42gq7pxUcOkhtt_JMtKAk5zWNouCpp7MfOgNqf37sw`,
  mojito: `${IMG_BASE}AB6AXuBa3zYCAN0dvxCihAN8W4xl3b7xx7bi5aL401fHnOqcpcUtbmMTxmLJmivs_X9-_DLzzyj-L4-mV8CWad4-BAFK0NukpthGwgejjQ6YE3B2hGoQGl5dkEXTv-gotQQvoRn1W_n7lhGglSCxaVZWk0C1nMJ5fmANg0Qn8oGRmDosk-YobSENRZG2uAPI3lzVRShNec0dNRw1FFbHpbie1umAR4JkIZYvWEMNLmbr7H_J_pbvg4q8waNrnQ`,
} as const;

export const SEED_PUBLIC_CART: PublicCartLine[] = [
  {
    id: 'woodfire-ribeye-250g',
    name: 'Woodfire Ribeye Steak (250g)',
    price: 16000,
    qty: 1,
    note: 'Medium rare, extra peppercorn sauce',
    image: PUBLIC_IMAGES.ribeye,
  },
  {
    id: 'double-smash-burger',
    name: 'Double Smash Burger',
    price: 6500,
    qty: 1,
    note: 'No pickles, extra napkins please',
    image: PUBLIC_IMAGES.burger,
  },
  {
    id: 'passionfruit-mojito',
    name: 'Passionfruit Mojito',
    price: 3500,
    qty: 1,
    image: PUBLIC_IMAGES.mojito,
  },
];

export const publicCartCount = (lines: PublicCartLine[]) => lines.reduce((sum, line) => sum + line.qty, 0);

export const publicCartTotals = (lines: PublicCartLine[]) => {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const vat = Math.round(subtotal * 0.075);
  return { subtotal, vat, total: subtotal + vat };
};
