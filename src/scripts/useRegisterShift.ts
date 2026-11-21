import { useState } from 'react';
import { apiErrorMessage } from '../services/errorMessages';
import { planErrorMessage } from '../services/planErrors';
import type { useLivePos } from './posLive';
import { useRegisterHistory } from '../hooks/business/usePos';

const amount = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

/**
 * The start-of-day and end-of-day register steps on the POS home (desktop and
 * mobile): the float, the drawer figures and the two confirmations. Live, every
 * figure comes from the open session; demo keeps the sample shift.
 */
export function useRegisterShift(pos: ReturnType<typeof useLivePos>, notify: (message: string) => void) {
  const live = pos.live;
  const drawerHistory = useRegisterHistory(live);
  const [demoOpen, setDemoOpen] = useState(true);
  const [demoFloat, setDemoFloat] = useState(50000);
  const [openRegisterModal, setOpenRegisterModal] = useState(false);
  const [closeRegisterModal, setCloseRegisterModal] = useState(false);
  const [openFloatInput, setOpenFloatInput] = useState(live ? '' : '50,000');
  const [countedCashInput, setCountedCashInput] = useState(live ? '' : '142,400');
  const [closeNotes, setCloseNotes] = useState('');
  const [lastZReport, setLastZReport] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const liveFloat = Number(pos.zReport?.openingCash ?? 0);
  const liveExpected = Number(pos.zReport?.expectedCash ?? liveFloat);
  const liveCash = Math.max(0, liveExpected - liveFloat);
  const registerOpen = live ? pos.isOpen : demoOpen;
  const openingFloat = live ? liveFloat : demoFloat;
  const cashSales = live ? liveCash : 92400;
  const cardSales = live ? Math.max(0, pos.breakdownTotal - liveCash) : 179050;
  const expectedCashInDrawer = live
    ? (pos.isOpen ? liveExpected : 0)
    : (demoOpen ? demoFloat + 92400 : 0);

  const confirmOpen = async (onSuccess?: () => void) => {
    const float = amount(openFloatInput);
    if (!live) {
      setDemoFloat(float || 50000);
      setDemoOpen(true);
      setOpenRegisterModal(false);
      notify(`Shift started! Opening float: ₦${(float || 50000).toLocaleString()}`);
      onSuccess?.();
      return;
    }
    setBusy(true);
    try {
      await pos.openOnTill(undefined, float);
      setOpenRegisterModal(false);
      setOpenFloatInput('');
      notify(`Register open · float ₦${float.toLocaleString()}`);
      onSuccess?.();
    } catch (error) {
      notify(planErrorMessage(error) ?? apiErrorMessage(error, 'Could not open the register.'));
    } finally {
      setBusy(false);
    }
  };

  const confirmClose = async () => {
    const counted = countedCashInput.trim() ? amount(countedCashInput) : expectedCashInDrawer;
    const difference = counted - expectedCashInDrawer;
    const summary = `Started ₦${openingFloat.toLocaleString()} · Closed ₦${counted.toLocaleString()} · Variance ₦${difference.toLocaleString()}`;
    if (!live) {
      setLastZReport(`Shift #0842 closed. ${summary}`);
      setDemoOpen(false);
      setCloseRegisterModal(false);
      notify('Register closed.');
      return;
    }
    setBusy(true);
    try {
      await pos.mutations.closeRegister.mutateAsync({ countedCash: counted });
      setLastZReport(`Shift closed. ${summary}`);
      setCloseRegisterModal(false);
      setCountedCashInput('');
      notify('Register closed.');
    } catch (error) {
      notify(apiErrorMessage(error, 'Could not close the register.'));
    } finally {
      setBusy(false);
    }
  };

  return {
    registerOpen,
    openingFloat,
    cashSales,
    cardSales,
    expectedCashInDrawer,
    shiftLabel: live ? pos.tillName : 'Shift #0842',
    tillLabel: live ? `${pos.branchArea || pos.branchName} • ${pos.tillName}` : 'Wuse II • Register 01',
    cashierLabel: live ? pos.cashierName : 'Emeka O.',
    openRegisterModal,
    setOpenRegisterModal,
    closeRegisterModal,
    setCloseRegisterModal,
    openFloatInput,
    setOpenFloatInput,
    countedCashInput,
    setCountedCashInput,
    closeNotes,
    setCloseNotes,
    drawerHistory,
    lastZReport,
    busy,
    confirmOpen,
    confirmClose,
  };
}
