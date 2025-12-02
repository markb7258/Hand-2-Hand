import CountryPageClient from './CountryPageClient';

export default function CountryPage({ params }: { params: { country: string } }) {
  return <CountryPageClient countrySlug={params.country} />;
}
