const FARE_BANDS = [
    { maxKm: 10, peak: 3.61, offPeak: 2.53 },
    { maxKm: 20, peak: 4.72, offPeak: 3.30 },
    { maxKm: 35, peak: 5.73, offPeak: 4.01 },
    { maxKm: 65, peak: 8.27, offPeak: 5.79 },
    { maxKm: Infinity, peak: 10.80, offPeak: 7.56 },
  ];
  
  export function calculateFare(distanceKm, isPeak) {
    const band = FARE_BANDS.find((b) => distanceKm <= b.maxKm);
    return isPeak ? band.peak : band.offPeak;
  }
  
  export function isPeakTime(date) {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();
    const minute = date.getMinutes();
    const timeInMinutes = hour * 60 + minute;
  
    // Weekends and Friday are always off-peak
    if (day === 0 || day === 5 || day === 6) return false;
  
    // Monday to Thursday peak times:
    // Morning: 7:00am - 9:00am
    // Afternoon: 4:00pm - 6:30pm
    const morningPeakStart = 7 * 60;
    const morningPeakEnd = 9 * 60;
    const afternoonPeakStart = 16 * 60;
    const afternoonPeakEnd = 18 * 60 + 30;
  
    return (
      (timeInMinutes >= morningPeakStart && timeInMinutes < morningPeakEnd) ||
      (timeInMinutes >= afternoonPeakStart && timeInMinutes < afternoonPeakEnd)
    );
  }