const FARE_BANDS = [
  { maxKm: 10, peak: 3.61, offPeak: 2.53 },
  { maxKm: 20, peak: 4.72, offPeak: 3.30 },
  { maxKm: 35, peak: 5.73, offPeak: 4.01 },
  { maxKm: 65, peak: 8.27, offPeak: 5.79 },
  { maxKm: Infinity, peak: 10.80, offPeak: 7.56 },
];

const BUS_FARES = [
  { maxKm: 3, cost: 2.50 },
  { maxKm: 8, cost: 3.66 },
  { maxKm: Infinity, cost: 4.95 },
];

export const CARD_TYPES = {
  adult: {
    label: 'Adult',
    multiplier: 1,
    dailyCap: { weekday: 19.30, weekend: 9.65 },
    weeklyCap: 50.00,
    airportFee: 17.34,
  },
  concession: {
    label: 'Concession / Child',
    multiplier: 0.5,
    dailyCap: { weekday: 9.65, weekend: 4.80 },
    weeklyCap: 25.00,
    airportFee: 15.50,
  },
  senior: {
    label: 'Senior / Pensioner',
    multiplier: 0.5,
    dailyCap: { weekday: 2.50, weekend: 2.50 },
    weeklyCap: null,
    airportFee: 15.50,
  },
  school: {
    label: 'School',
    multiplier: 0,
    dailyCap: { weekday: 0, weekend: 0 },
    weeklyCap: 0,
    airportFee: 0,
  },
};

export function calculateFare(distanceKm, isPeak, cardType = 'adult', mode) {
  const card = CARD_TYPES[cardType];
  if (card.multiplier === 0) return 0;

  if (mode === 'Bus') {
    const band = BUS_FARES.find((b) => distanceKm <= b.maxKm);
    return Math.round(band.cost * card.multiplier * 100) / 100;
  } else {
    const band = FARE_BANDS.find((b) => distanceKm <= b.maxKm);
    const baseFare = isPeak ? band.peak : band.offPeak;
    return Math.round(baseFare * card.multiplier * 100) / 100;
  }
}





export function getAirportFee(cardType = 'adult') {
  return CARD_TYPES[cardType]?.airportFee ?? 0;
}

export function isSchoolCardValid(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;

  const timeInMinutes = date.getHours() * 60 + date.getMinutes();
  return timeInMinutes >= 390 && timeInMinutes <= 1140; // 6:30am – 7:00pm
}

export function isPeakTime(date) {
  const day = date.getDay();
  const timeInMinutes = date.getHours() * 60 + date.getMinutes();

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
