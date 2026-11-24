import { SectionPage } from './SectionPage';

export function NotFoundPage() {
  return (
    <SectionPage
      title="Esta página no existe"
      intro="Puede que el enlace haya cambiado. Desde el inicio puedes llegar a cualquier módulo."
      noindex
    />
  );
}
