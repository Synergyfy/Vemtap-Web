import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hasApiConfig } from '../services/api/client';
import { addressesService, type AddressInput, type SavedAddress } from '../services/addressesService';

const ADDRESSES_KEY = ['me', 'addresses'] as const;

/** Demo-build sample so the screen is not empty without an API. */
const DEMO_ADDRESSES: SavedAddress[] = [
  {
    id: 'home',
    label: 'Home',
    line: '12 Aminu Kano Crescent, Wuse II',
    area: 'Abuja, FCT',
    notes: null,
    latitude: null,
    longitude: null,
    isDefault: true,
  },
  {
    id: 'office',
    label: 'Office',
    line: 'Plot 700 Ahmadu Bello Way, Central Business District',
    area: 'Abuja, FCT',
    notes: null,
    latitude: null,
    longitude: null,
    isDefault: false,
  },
];

export interface SavedAddressesState {
  addresses: SavedAddress[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
  save: (input: AddressInput, id?: string) => Promise<void>;
  makeDefault: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/** Saved addresses: `/me/addresses` when an API is configured, local demo state otherwise. */
export function useSavedAddresses(): SavedAddressesState {
  const live = hasApiConfig();
  const queryClient = useQueryClient();
  const [demo, setDemo] = useState<SavedAddress[]>(DEMO_ADDRESSES);

  const query = useQuery({ queryKey: ADDRESSES_KEY, queryFn: addressesService.list, enabled: live });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });

  const saveMutation = useMutation({
    mutationFn: ({ input, id }: { input: AddressInput; id?: string }) =>
      id ? addressesService.update(id, input) : addressesService.create(input),
    onSuccess: invalidate,
  });
  const defaultMutation = useMutation({ mutationFn: addressesService.setDefault, onSuccess: invalidate });
  const removeMutation = useMutation({ mutationFn: addressesService.remove, onSuccess: invalidate });

  if (live) {
    return {
      addresses: query.data ?? [],
      isLoading: query.isLoading,
      error: query.error,
      refetch: () => void query.refetch(),
      save: async (input, id) => {
        await saveMutation.mutateAsync({ input, id });
      },
      makeDefault: async (id) => {
        await defaultMutation.mutateAsync(id);
      },
      remove: async (id) => {
        await removeMutation.mutateAsync(id);
      },
    };
  }

  return {
    addresses: demo,
    isLoading: false,
    error: null,
    refetch: () => undefined,
    save: async (input, id) => {
      setDemo((prev) => {
        const makeDefault = input.isDefault === true || prev.length === 0;
        const base = makeDefault ? prev.map((item) => ({ ...item, isDefault: false })) : prev;
        if (id) {
          return base.map((item) =>
            item.id === id
              ? { ...item, ...input, area: input.area ?? null, notes: input.notes ?? null, isDefault: makeDefault || item.isDefault }
              : item,
          );
        }
        return [
          ...base,
          {
            id: `local-${Date.now()}`,
            label: input.label,
            line: input.line,
            area: input.area ?? null,
            notes: input.notes ?? null,
            latitude: null,
            longitude: null,
            isDefault: makeDefault,
          },
        ];
      });
    },
    makeDefault: async (id) => {
      setDemo((prev) => prev.map((item) => ({ ...item, isDefault: item.id === id })));
    },
    remove: async (id) => {
      setDemo((prev) => {
        const removed = prev.find((item) => item.id === id);
        const next = prev.filter((item) => item.id !== id);
        if (removed?.isDefault && next[0]) next[0] = { ...next[0], isDefault: true };
        return next;
      });
    },
  };
}
