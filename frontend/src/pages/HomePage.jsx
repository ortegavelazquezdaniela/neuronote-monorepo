import { usePageMeta } from '../hooks/usePageMeta';
import { Hero } from '../organisms/Hero';
import { ModulesSection } from '../organisms/ModulesSection';
import { MapPreview } from '../organisms/MapPreview';
import { PurposeSection } from '../organisms/PurposeSection';

export function HomePage() {
  usePageMeta();
  return (
    <>
      <Hero />
      <ModulesSection />
      <MapPreview />
      <PurposeSection />
    </>
  );
}
