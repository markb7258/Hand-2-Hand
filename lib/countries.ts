// Country data with populations, flags, and default group counts
export const COUNTRIES = [
  { name: 'Argentina', slug: 'argentina', population: '46,234,830', flag: '🇦🇷' },
  { name: 'Bolivia', slug: 'bolivia', population: '12,224,110', flag: '🇧🇴' },
  { name: 'Chile', slug: 'chile', population: '19,629,590', flag: '🇨🇱' },
  { name: 'Colombia', slug: 'colombia', population: '52,085,168', flag: '🇨🇴' },
  { name: 'Costa Rica', slug: 'costa-rica', population: '5,180,829', flag: '🇨🇷' },
  { name: 'Cuba', slug: 'cuba', population: '11,194,449', flag: '🇨🇺' },
  { name: 'Dominican Republic', slug: 'dominican-republic', population: '11,332,972', flag: '🇩🇴' },
  { name: 'Ecuador', slug: 'ecuador', population: '18,001,000', flag: '🇪🇨' },
  { name: 'El Salvador', slug: 'el-salvador', population: '6,336,392', flag: '🇸🇻' },
  { name: 'Guatemala', slug: 'guatemala', population: '18,092,026', flag: '🇬🇹' },
  { name: 'Honduras', slug: 'honduras', population: '10,432,860', flag: '🇭🇳' },
  { name: 'Mexico', slug: 'mexico', population: '128,455,567', flag: '🇲🇽' },
  { name: 'Nicaragua', slug: 'nicaragua', population: '7,046,310', flag: '🇳🇮' },
  { name: 'Panama', slug: 'panama', population: '4,468,087', flag: '🇵🇦' },
  { name: 'Paraguay', slug: 'paraguay', population: '6,861,524', flag: '🇵🇾' },
  { name: 'Peru', slug: 'peru', population: '34,352,719', flag: '🇵🇪' },
  { name: 'Uruguay', slug: 'uruguay', population: '3,423,108', flag: '🇺🇾' },
  { name: 'Venezuela', slug: 'venezuela', population: '28,838,499', flag: '🇻🇪' },
  { name: 'United States', slug: 'united-states', population: '331,900,000', flag: '🇺🇸' },
  { name: 'Canada', slug: 'canada', population: '39,742,430', flag: '🇨🇦' },
  { name: 'Brazil', slug: 'brazil', population: '215,313,498', flag: '🇧🇷' },
] as const;

export const DEFAULT_GROUPS = 12;

export type CountrySlug = typeof COUNTRIES[number]['slug'];
