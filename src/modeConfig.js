export const MODE_INFO = {
  1: { label: 'Train', icon: '/icons/train.png' },
  2: { label: 'Metro', icon: '/icons/metro.png' },
  4: { label: 'Light Rail', icon: '/icons/lightrail.png' },
  5: { label: 'Bus', icon: '/icons/bus.png' },
};

export const MODE_NAME_TO_CODE = {
  'Sydney Trains Network': 1,
  'Sydney Metro Network': 2,
  'Sydney Light Rail Network': 4,
  'Sydney Buses Network': 5,
};

export function getModeIcon(modeName) {
  const code = MODE_NAME_TO_CODE[modeName];
  return code ? MODE_INFO[code]?.icon : null;
}

export function getModeLabel(modeName) {
  const code = MODE_NAME_TO_CODE[modeName];
  return code ? MODE_INFO[code]?.label : modeName;
}
