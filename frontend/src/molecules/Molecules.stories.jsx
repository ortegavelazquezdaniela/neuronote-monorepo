import { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Button } from '../atoms/Button';
import { EmptyState } from './EmptyState';
import { LayerToggle } from './LayerToggle';
import { RouteCompare } from './RouteCompare';
import { PanelSection } from './PanelSection';
import { HavenList } from './HavenList';

export default { title: 'Moléculas/Varias' };

export const EstadoVacio = {
  render: () => (
    <EmptyState icon={NotebookPen} title="Todavía no tienes notas" action={<Button size="sm">Escribir la primera</Button>}>
      Cuando guardes la primera, aparecerá aquí. Solo tú puedes verla.
    </EmptyState>
  ),
};

export const CapaDelMapa = {
  render: function Story() {
    const [on, setOn] = useState(true);
    return (
      <LayerToggle swatch="havens" pressed={on} onToggle={() => setOn((v) => !v)}>
        Oasis candidatos
      </LayerToggle>
    );
  },
};

/** Valores de demostración, etiquetados como tales dentro del componente. */
export const ComparadorDeRutas = { render: () => <div style={{ maxWidth: '22rem' }}><RouteCompare /></div> };

export const SeccionDePanel = {
  render: () => (
    <PanelSection id="demo" title="Microclima">
      <p>Contenido de la sección.</p>
    </PanelSection>
  ),
};

/** Lugares de ejemplo con nombre ficticio (solo para el catálogo). */
export const ListaDeOasis = {
  render: () => (
    <HavenList
      origin={{ lat: 19.4326, lon: -99.1332 }}
      havens={[
        { id: 'way-1', name: 'Parque de ejemplo', type: 'park', lat: 19.4335, lon: -99.134, wheelchair: 'yes' },
        { id: 'node-2', name: 'Biblioteca de ejemplo', type: 'library', lat: 19.435, lon: -99.138, wheelchair: null },
      ]}
    />
  ),
};
