import { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { DesktopPage, type DesktopNavKey } from '../../components/ui/DesktopChrome';

interface DesktopSpaBookingScreenProps {
  onNav: (key: DesktopNavKey) => void;
  onBack: () => void;
}

const DAYS = [
  { dow: 'Mon', date: 14, status: 'Booked', disabled: true },
  { dow: 'Tue', date: 15, status: '4 slots', disabled: false },
  { dow: 'Wed', date: 16, status: '2 slots', disabled: false },
  { dow: 'Thu', date: 17, status: '7 slots', disabled: false },
  { dow: 'Fri', date: 18, status: '6 slots', disabled: false },
  { dow: 'Sat', date: 19, status: '1 left', disabled: false, muted: true },
  { dow: 'Sun', date: 20, status: 'Closed', disabled: true },
];

const TIME_GROUPS = [
  {
    icon: 'light_mode',
    label: 'Morning (09:00 AM – 12:00 PM)',
    highlight: false,
    slots: [
      { time: '09:30 AM', disabled: false },
      { time: '10:45 AM', disabled: false },
      { time: '11:15 AM', disabled: true },
      { time: '11:45 AM', disabled: false },
    ],
  },
  {
    icon: 'wb_sunny',
    label: 'Afternoon (12:00 PM – 04:00 PM)',
    highlight: true,
    slots: [
      { time: '01:15 PM', disabled: false },
      { time: '02:30 PM', disabled: false },
      { time: '03:15 PM', disabled: false },
      { time: '03:45 PM', disabled: true },
    ],
  },
  {
    icon: 'dark_mode',
    label: 'Evening (04:00 PM – 08:00 PM)',
    highlight: false,
    slots: [
      { time: '04:30 PM', disabled: false },
      { time: '05:15 PM', disabled: false },
      { time: '06:00 PM', disabled: false },
      { time: '07:00 PM', disabled: false },
    ],
  },
];

const TREATMENTS = [
  {
    title: 'Deep Hydration Radiance Facial',
    meta: ['60 mins', 'Double Cleanse • Ultrasonic Infusion'],
    price: '₦16,000',
    priceLabel: 'VEMTAP Special',
    priceTone: 'text-badge-discount-text font-semibold',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBwgkHkvOPD-PFljEIRkzZFascsWqjLAMjF_D2JI8rl-y4Fq1oylRkG6KlUAfzq5fC0vpKHgkNpM6E_VDAXog9kZHNhvti4eWqwuteqgKGhcJ-T2xaaIh5dbqGf_XkSU2_zgnnTU_mCrNp52_aruLSJTEwBwdRXHxLveLqxlKxjMtYRPF6tfsq3hpXDOmCRirZQuGs_BT1feNVrRxemaNlLNMKUS4yHPz8rDUEf6bWo',
    alt: 'Close up photography of soothing organic facial treatment session with botanical serum applied delicately on glowing hydrated skin under calm warm lighting inside an Abuja luxury spa.',
  },
  {
    title: 'Deluxe Gel Manicure & Hand Therapy',
    meta: ['45 mins', 'Cuticle Care • Exfoliation Scrub'],
    price: '₦9,000',
    priceLabel: 'Standard Rate',
    priceTone: 'text-text-secondary',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC99pJkZ8N69hKSf7wry4izwOCf4Nvt6jbAVu9PCK6G1-tTRNMtaYF-3VawmVcAUEJItE4vzfVzWozRpPjn474zoM_4A4tkGueVSjRjw7J55ue_VRhHLA06M8n9FBP9AVt5uVmPHqHS5XItfAzwCQ5EC7EIY8IGQR4_23ev-5o8-x9uvdohYudfAM993Tz0TszcpXg_2ysk3y5J5R6cUmS5l2qMwomhNssKy5vsUk1J',
    alt: 'High end luxury gel manicure aesthetic shot displaying elegant clean fingernails with gentle lavender tones on marble surface with therapeutic almond oils.',
  },
];

const ADDONS = [
  {
    label: '+ LED Light Therapy Booster',
    description: '15 mins • Collagen stimulation & deep redness reduction',
    price: '+₦4,000',
    defaultChecked: true,
  },
  {
    label: '+ Organic Eye Contour Mask & Lymphatic Tap',
    description: '10 mins • De-puffs and brightens dark circles',
    price: '+₦2,500',
    defaultChecked: false,
  },
];

export function DesktopSpaBookingScreen({ onNav, onBack }: DesktopSpaBookingScreenProps) {
  const [selectedDay, setSelectedDay] = useState(17);
  const [selectedTime, setSelectedTime] = useState('01:15 PM');
  const [specialist, setSpecialist] = useState<'amara' | 'any'>('amara');
  const [serviceMode, setServiceMode] = useState<'salon' | 'mobile'>('salon');
  const [checkedAddons, setCheckedAddons] = useState<string[]>(
    ADDONS.filter((addon) => addon.defaultChecked).map((addon) => addon.label),
  );

  const toggleAddon = (label: string) =>
    setCheckedAddons((current) =>
      current.includes(label) ? current.filter((item) => item !== label) : [...current, label],
    );

  return (
    <DesktopPage withHeader withFooter onNav={onNav} activeNav="businesses">
      <div className="w-full bg-surface">
        <div className="w-full bg-surface-subtle py-4 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to Glow & Serenity Spa catalog"
                className="p-2 rounded-xl bg-surface-canvas text-on-surface-variant hover:text-primary hover:bg-surface-tint-blue shadow-sm transition-all flex items-center justify-center"
              >
                <Icon name="arrow_back" className="text-[20px]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-caption text-caption text-text-secondary uppercase tracking-wider">
                    Appointment Checkout
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold">
                    Special 20% Off
                  </span>
                </div>
                <h1 className="font-heading-md text-heading-md text-on-surface tracking-tight">
                  Glow &amp; Serenity Spa &amp; Salon
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4 text-text-secondary font-label-sm text-label-sm">
              <div className="flex items-center gap-1.5">
                <Icon name="verified" className="text-primary text-[18px]" />
                <span>VEMTAP Guaranteed Slot</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Icon name="lock" className="text-[18px]" />
                <span>No Upfront Charge</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-surface-canvas rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shadow-md">
                      1
                    </span>
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-on-surface">
                        Step 1 of 3: Schedule &amp; Preferences
                      </p>
                      <p className="font-caption text-caption text-text-secondary">
                        Select your date, specialist, and customized treatment add-ons
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-7 rounded-full bg-primary" />
                    <span className="h-2 w-7 rounded-full bg-primary/40" />
                    <span className="h-2 w-2 rounded-full bg-surface-container-high" />
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="calendar_month" className="text-primary text-[26px]" />
                    <h2 className="font-heading-sm text-heading-sm text-on-surface">Select Date &amp; Time</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-subtle p-1 rounded-xl">
                    <button
                      type="button"
                      className="px-3 py-1 text-label-sm font-label-sm rounded-lg bg-surface-canvas text-primary font-semibold shadow-sm"
                    >
                      October 2024
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 text-label-sm font-label-sm rounded-lg text-text-secondary hover:text-on-surface transition-colors"
                    >
                      November 2024
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-text-secondary font-medium">
                      Available Days (October 2024)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Previous week"
                        className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-on-surface"
                      >
                        <Icon name="chevron_left" className="text-[18px]" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next week"
                        className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-text-secondary hover:text-on-surface"
                      >
                        <Icon name="chevron_right" className="text-[18px]" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                    {DAYS.map((day) => {
                      const isSelected = selectedDay === day.date;
                      if (day.disabled) {
                        return (
                          <div
                            key={day.date}
                            className="p-3 rounded-xl bg-surface-subtle flex flex-col items-center gap-1 opacity-45 cursor-not-allowed"
                          >
                            <span className="font-caption text-caption text-text-tertiary">{day.dow}</span>
                            <span className="font-heading-sm text-heading-sm text-text-secondary">{day.date}</span>
                            <span className="font-caption text-caption text-text-tertiary">{day.status}</span>
                          </div>
                        );
                      }
                      return (
                        <button
                          key={day.date}
                          type="button"
                          onClick={() => setSelectedDay(day.date)}
                          className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-primary text-on-primary shadow-md transform scale-[1.02] relative'
                              : 'bg-surface-subtle hover:bg-surface-container'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-tertiary text-on-tertiary font-caption text-[10px] uppercase font-bold tracking-tight">
                              Selected
                            </span>
                          )}
                          <span
                            className={`font-caption text-caption ${isSelected ? 'text-on-primary/80' : 'text-text-secondary'}`}
                          >
                            {day.dow}
                          </span>
                          <span
                            className={`font-heading-sm text-heading-sm ${isSelected ? 'font-bold' : 'text-text-primary'}`}
                          >
                            {day.date}
                          </span>
                          <span
                            className={`font-caption text-caption font-medium ${
                              isSelected
                                ? 'text-on-primary'
                                : day.muted
                                  ? 'text-text-tertiary'
                                  : 'text-badge-discount-text'
                            }`}
                          >
                            {day.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Available Start Times for Thu, Oct 17
                  </span>
                  <div className="space-y-4">
                    {TIME_GROUPS.map((group) => (
                      <div key={group.label}>
                        <div
                          className={`flex items-center gap-2 mb-2 ${group.highlight ? 'text-primary' : 'text-text-secondary'}`}
                        >
                          <Icon name={group.icon} className="text-[18px]" />
                          <span
                            className={`font-caption text-caption uppercase tracking-wider ${
                              group.highlight ? 'font-bold' : 'font-semibold'
                            }`}
                          >
                            {group.label}
                          </span>
                          {group.highlight && (
                            <span className="font-caption text-caption text-badge-discount-text bg-badge-discount-bg px-2 py-0.5 rounded-full font-semibold">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {group.slots.map((slot) => {
                            const isSelected = selectedTime === slot.time;
                            if (slot.disabled) {
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled
                                  className="py-2.5 px-3 rounded-xl bg-surface-subtle opacity-40 font-label-sm text-label-sm text-text-tertiary cursor-not-allowed text-center line-through"
                                >
                                  {slot.time}
                                </button>
                              );
                            }
                            return (
                              <button
                                key={slot.time}
                                type="button"
                                onClick={() => setSelectedTime(slot.time)}
                                className={`py-2.5 px-3 rounded-xl font-label-sm text-label-sm transition-all ${
                                  isSelected
                                    ? 'bg-primary text-on-primary font-semibold shadow-md flex items-center justify-center gap-1.5'
                                    : 'bg-surface-subtle text-text-primary hover:bg-surface-container-high text-center'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Icon name="check_circle" className="text-[16px]" />
                                    <span>{slot.time}</span>
                                  </>
                                ) : (
                                  slot.time
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="badge" className="text-primary text-[26px]" />
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">
                        Specialist &amp; Service Mode
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Choose your dedicated aesthetician and service arrangement
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Select Therapist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label
                      className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                        specialist === 'amara'
                          ? 'bg-surface-tint-blue shadow-sm'
                          : 'bg-surface-subtle hover:bg-surface-container'
                      }`}
                    >
                      <input
                        checked={specialist === 'amara'}
                        className="accent-primary w-5 h-5"
                        name="specialist"
                        onChange={() => setSpecialist('amara')}
                        type="radio"
                      />
                      <img
                        alt="Portrait of Amara K., professional African female lead aesthetician wearing clean white medical spa uniform smiling warmly in a bright modern wellness clinic with soft ambient lighting."
                        className="w-14 h-14 rounded-full object-cover shadow-sm"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqP20vT_xbpjLWZpTa3nwplWE79bhgs6nddSXJmH9fKdRjm86ubFC_5IeQ4BPD4GHB-xVSzMHhl7tuNqEIeQd-ukixs1jIEoRg0lKJ4YnqF6yH8ua0-4ic88FUFbihPc5Bpvz2Zzitcc79GYrTv9eKskeKof77FwzNGfgrmVSFVZ4ZkWTOHziCfS8IFBt0mlFowB_O3yDtfoIeqzqHJhFhJ95JEX8HvLGp5SnGMnIy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-label-md text-label-md font-bold text-on-surface">Amara K.</span>
                          <Icon name="verified" className="text-primary text-[16px]" />
                        </div>
                        <p className="font-caption text-caption text-primary font-semibold">
                          Lead Aesthetician • 6 yrs exp
                        </p>
                        <p className="font-caption text-caption text-text-secondary truncate">
                          ★ 4.97 (184 local client reviews)
                        </p>
                      </div>
                    </label>
                    <label
                      className={`relative flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors ${
                        specialist === 'any'
                          ? 'bg-surface-tint-blue shadow-sm'
                          : 'bg-surface-subtle hover:bg-surface-container'
                      }`}
                    >
                      <input
                        checked={specialist === 'any'}
                        className="accent-primary w-5 h-5"
                        name="specialist"
                        onChange={() => setSpecialist('any')}
                        type="radio"
                      />
                      <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-text-secondary">
                        <Icon name="groups" className="text-[28px]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          Any Available Specialist
                        </span>
                        <p className="font-caption text-caption text-text-secondary">Fastest seating guaranteed</p>
                        <p className="font-caption text-caption text-text-tertiary">
                          Matched automatically on arrival
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    Service Delivery Mode
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setServiceMode('salon')}
                      className={`p-4 rounded-xl flex items-center gap-3.5 cursor-pointer transition-colors text-left ${
                        serviceMode === 'salon'
                          ? 'bg-surface-tint-blue'
                          : 'bg-surface-subtle hover:bg-surface-container opacity-70'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                          serviceMode === 'salon' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        <Icon name="storefront" className="text-[20px]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-label-md font-bold text-on-surface">In-Salon Visit</span>
                          <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                            Standard
                          </span>
                        </div>
                        <span className="font-caption text-caption text-text-secondary">
                          Plot 14 Amazon St, Maitama Heights
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceMode('mobile')}
                      className={`p-4 rounded-xl flex items-center gap-3.5 cursor-pointer transition-colors text-left ${
                        serviceMode === 'mobile'
                          ? 'bg-surface-tint-blue'
                          : 'bg-surface-subtle hover:bg-surface-container opacity-70'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          serviceMode === 'mobile' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-text-secondary'
                        }`}
                      >
                        <Icon name="home_pin" className="text-[20px]" />
                      </div>
                      <div>
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          Mobile / Home Service
                        </span>
                        <span className="block font-caption text-caption text-text-tertiary">
                          +₦6,500 callout fee (Maitama only)
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-surface-canvas rounded-xl p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-surface-container-low">
                  <div className="flex items-center gap-3">
                    <Icon name="spa" className="text-primary text-[26px]" />
                    <div>
                      <h2 className="font-heading-sm text-heading-sm text-on-surface">
                        Selected Treatments &amp; Add-on Boosters
                      </h2>
                      <p className="font-caption text-caption text-text-secondary">
                        Review included procedures and customize session intensity
                      </p>
                    </div>
                  </div>
                  <button type="button" className="font-label-sm text-label-sm font-semibold text-primary cursor-pointer hover:underline">
                    + Add Service
                  </button>
                </div>
                <div className="space-y-4">
                  {TREATMENTS.map((treatment) => (
                    <div
                      key={treatment.title}
                      className="flex items-center justify-between p-4 rounded-xl bg-surface-subtle"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          alt={treatment.alt}
                          className="w-16 h-16 rounded-xl object-cover"
                          src={treatment.image}
                        />
                        <div className="min-w-0">
                          <h3 className="font-label-md text-label-md font-bold text-on-surface truncate">
                            {treatment.title}
                          </h3>
                          <div className="flex items-center gap-2 text-text-secondary font-caption text-caption mt-0.5">
                            <Icon name="schedule" className="text-[15px]" />
                            <span>{treatment.meta[0]}</span>
                            <span>•</span>
                            <span>{treatment.meta[1]}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          {treatment.price}
                        </span>
                        <span className={`block font-caption text-caption ${treatment.priceTone}`}>
                          {treatment.priceLabel}
                        </span>
                      </div>
                    </div>
                  ))}

                  {ADDONS.map((addon) => {
                    const isChecked = checkedAddons.includes(addon.label);
                    return (
                      <div
                        key={addon.label}
                        className={`p-4 rounded-xl flex items-center justify-between transition-all ${
                          isChecked
                            ? 'bg-surface-tint-blue'
                            : 'bg-surface-subtle opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            checked={isChecked}
                            className="mt-1 accent-primary w-5 h-5 rounded cursor-pointer"
                            onChange={() => toggleAddon(addon.label)}
                            type="checkbox"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-label-md text-on-surface ${isChecked ? 'font-bold' : 'font-semibold'}`}
                              >
                                {addon.label}
                              </span>
                              {isChecked && (
                                <span className="px-2 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                                  Selected Add-on
                                </span>
                              )}
                            </div>
                            <p className="font-caption text-caption text-text-secondary mt-0.5">
                              {addon.description}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-label-md shrink-0 ${isChecked ? 'font-bold text-primary' : 'font-semibold text-text-secondary'}`}
                        >
                          {addon.price}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-md text-label-md font-semibold text-on-surface"
                      htmlFor="skin-notes"
                    >
                      Skin Sensitivities &amp; Consultation Notes
                    </label>
                    <span className="font-caption text-caption text-text-tertiary">Shared directly with Amara K.</span>
                  </div>
                  <textarea
                    className="w-full p-4 rounded-xl bg-surface-subtle text-on-surface font-body-md text-body-md focus:bg-surface-canvas focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-text-tertiary resize-none"
                    id="skin-notes"
                    placeholder="Provide notes regarding skin reactions, allergies, retinoids, or pressure preferences..."
                    rows={3}
                    defaultValue="Sensitive to retinol, prefers gentle pressure on cheeks and warm towel finishing."
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 sticky top-28 space-y-6">
              <div className="bg-surface-canvas rounded-xl p-6 shadow-md space-y-6">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                      Summary Voucher
                    </span>
                    <span className="font-caption text-caption text-text-secondary">Ref #VT-88210</span>
                  </div>
                  <h3 className="font-heading-sm text-heading-sm text-on-surface pt-1">Booking Confirmation</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Review reservation terms prior to confirming
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-subtle space-y-3.5">
                  <div className="flex items-start gap-3">
                    <Icon name="schedule" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">
                        Date &amp; Estimated Duration
                      </span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Thursday, Oct 17 • 1:15 PM
                      </span>
                      <span className="font-caption text-caption text-text-tertiary block">
                        Total session: ~2 hrs (Facial + Nails + Booster)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="person" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Assigned Specialist</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Amara K. (Lead Aesthetician)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="pin_drop" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Salon Location</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">
                        Plot 14 Amazon St, Maitama
                      </span>
                      <span className="font-caption text-caption text-text-tertiary block">
                        Abuja • Free valet parking on premises
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icon name="badge" className="text-primary text-[20px] mt-0.5" />
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Client Credentials</span>
                      <span className="font-label-md text-label-md font-bold text-on-surface">Zainab Ahmed</span>
                      <span className="font-caption text-caption text-text-secondary block">
                        +234 803 555 0192 • zainab.a@example.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="font-label-md text-label-md font-bold text-on-surface">Payment Breakdown</span>
                  <div className="space-y-2 text-text-secondary font-body-md text-body-md">
                    <div className="flex justify-between items-center">
                      <span>Services Subtotal (3 items)</span>
                      <span className="text-on-surface font-semibold">₦29,000</span>
                    </div>
                    <div className="flex justify-between items-center text-badge-discount-text">
                      <div className="flex items-center gap-1.5">
                        <Icon name="local_offer" className="text-[16px]" />
                        <span>VEMTAP Deal (VT-SPA8821)</span>
                      </div>
                      <span className="font-bold">-₦5,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span>VEMTAP Booking Fee</span>
                        <span className="px-1.5 py-0.2 rounded bg-badge-discount-bg text-badge-discount-text font-caption text-[11px] font-bold">
                          100% Free
                        </span>
                      </div>
                      <span className="text-badge-discount-text font-bold">₦0.00</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-surface-container-low flex justify-between items-end">
                    <div>
                      <span className="font-caption text-caption text-text-secondary uppercase font-bold tracking-wider">
                        Total Payable at Salon
                      </span>
                      <p className="font-caption text-caption text-text-tertiary">Pay upon completed service</p>
                    </div>
                    <span className="font-heading-lg text-heading-lg font-bold text-primary">₦24,000</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-subtle space-y-2">
                  <div className="flex items-center gap-2 text-on-surface font-label-sm text-label-sm font-bold">
                    <Icon name="payments" className="text-primary text-[18px]" />
                    <span>Zero Prepayment Required</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary leading-relaxed">
                    VEMTAP holds your slot without charging your card today. Simply present your VEMTAP code at the
                    reception. Accepted on-site:{' '}
                    <strong className="text-text-primary">POS Card, Bank Transfer, or Cash</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-badge-discount-text bg-badge-discount-bg p-3 rounded-xl">
                  <Icon name="check_circle" className="text-[20px] shrink-0" />
                  <span className="font-caption text-caption font-semibold">
                    Free cancellation up to 2 hours before appointment time.
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    className="w-full h-14 rounded-xl bg-primary text-on-primary font-button-primary text-button-primary shadow-lg hover:bg-primary/95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Confirm Appointment (₦24,000)</span>
                    <Icon name="arrow_forward" className="text-[20px]" />
                  </button>
                  <button
                    type="button"
                    className="w-full py-3 rounded-xl bg-surface-subtle hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon name="chat" className="text-[18px]" />
                    <span>Direct Chat with Reception</span>
                  </button>
                  <button
                    type="button"
                    onClick={onBack}
                    className="block w-full text-center font-caption text-caption text-text-secondary hover:text-primary transition-colors py-1"
                  >
                    Cancel &amp; Return to Glow &amp; Serenity catalog
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-surface-tint-blue flex items-center gap-3 shadow-sm">
                <Icon name="support_agent" className="text-primary text-[28px] shrink-0" />
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">Need immediate help?</h4>
                  <p className="font-caption text-caption text-text-secondary">
                    Call VEMTAP Concierge at +234 (0) 9 460 2200 for priority booking support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DesktopPage>
  );
}
