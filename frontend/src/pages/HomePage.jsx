import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Hero } from '../organisms/Hero';
import { ModulesSection } from '../organisms/ModulesSection';
import { MapPreview } from '../organisms/MapPreview';
import { PurposeSection } from '../organisms/PurposeSection';

export function HomePage() {
  useDocumentTitle(null);
  return (
    <>
      <Hero />
      <ModulesSection />
      <MapPreview />
      <PurposeSection />
    </>
  );
}
