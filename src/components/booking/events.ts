export type BookingPreset = { arrival?: string; departure?: string; adults?: number };

export function openBooking(preset: BookingPreset = {}) {
  window.dispatchEvent(new CustomEvent<BookingPreset>("velence:open-booking", { detail: preset }));
}
