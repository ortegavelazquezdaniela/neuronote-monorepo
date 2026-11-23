import { RotateCcw, Trees } from 'lucide-react';
import { Button } from '../atoms/Button';
import { StatusMessage } from '../atoms/StatusMessage';
import { EmptyState } from '../molecules/EmptyState';
import { HavenList } from '../molecules/HavenList';
import { describeError } from '../services/http';

/** Estados de carga, error, vacío y lista para los oasis candidatos. */
export function HavenResults({ query, havens, origin, selectedId, onSelect, limit }) {
  if (query.status === 'loading') {
    return (
      <p role="status" style={{ color: 'var(--color-text-soft)', fontSize: 'var(--fs-sm)' }}>
        Buscando parques, jardines, bibliotecas y museos cercanos en OpenStreetMap…
      </p>
    );
  }
  if (query.status === 'error') {
    return (
      <StatusMessage tone="error" title="No pudimos cargar los lugares">
        <p>{describeError(query.error)}</p>
        <Button size="sm" variant="secondary" icon={RotateCcw} iconPosition="start" onClick={query.retry}>
          Intentar de nuevo
        </Button>
      </StatusMessage>
    );
  }
  if (!havens.length) {
    return (
      <EmptyState icon={Trees} title="No encontramos lugares con estos filtros">
        Prueba con otro tipo de lugar o elige otro punto en el mapa.
      </EmptyState>
    );
  }
  return (
    <>
      {query.meta?.stale && (
        <StatusMessage tone="info" title="Mostrando datos guardados">
          OpenStreetMap no respondió. Esta lista es de la última consulta exitosa (
          {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
            new Date(query.meta.fetchedAt),
          )}
          ).
        </StatusMessage>
      )}
      <HavenList havens={havens} origin={origin} selectedId={selectedId} onSelect={onSelect} limit={limit} />
    </>
  );
}
