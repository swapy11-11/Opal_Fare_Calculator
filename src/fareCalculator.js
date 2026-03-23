const FARE_BANDS = [
  { maxKm: 10, peak: 3.61, offPeak: 2.53 },
  { maxKm: 20, peak: 4.72, offPeak: 3.30 },
  { maxKm: 35, peak: 5.73, offPeak: 4.01 },
  { maxKm: 65, peak: 8.27, offPeak: 5.79 },
  { maxKm: Infinity, peak: 10.80, offPeak: 7.56 },
];

export const CARD_TYPES = {
  adult: {
    label: 'Adult',
    multiplier: 1,
    dailyCap: { weekday: 19.30, weekend: 9.65 },
    weeklyCap: 50.00,
  },
  concession: {
    label: 'Concession / Child',
    multiplier: 0.5,
    dailyCap: { weekday: 9.65, weekend: 4.80 },
    weeklyCap: 25.00,
  },
  senior: {
    label: 'Senior / Pensioner',
    multiplier: 0.5,
    dailyCap: { weekday: 2.50, weekend: 2.50 },
    weeklyCap: null,
  },
  school: {
    label: 'School',
    multiplier: 0,
    dailyCap: { weekday: 0, weekend: 0 },
    weeklyCap: 0,
  },
};

export function calculateFare(distanceKm, isPeak, cardType = 'adult') {
  const card = CARD_TYPES[cardType];
  if (card.multiplier === 0) return 0;

  const band = FARE_BANDS.find((b) => distanceKm <= b.maxKm);
  const baseFare = isPeak ? band.peak : band.offPeak;
  return Math.round(baseFare * card.multiplier * 100) / 100;
}

export function isPeakTime(date) {
  const day = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  if (day === 0 || day === 5 || day === 6) return false;

  const morningPeakStart = 6 * 60 + 30;
  const morningPeakEnd = 10 * 60;
  const afternoonPeakStart = 15 * 60;
  const afternoonPeakEnd = 19 * 60;

  return (
    (timeInMinutes >= morningPeakStart && timeInMinutes < morningPeakEnd) ||
    (timeInMinutes >= afternoonPeakStart && timeInMinutes < afternoonPeakEnd)
  );
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 5 || day === 6;
}
