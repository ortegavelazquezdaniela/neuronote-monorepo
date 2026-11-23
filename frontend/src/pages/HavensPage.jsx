import { useState } from 'react';
import { Switch } from '../atoms/Switch';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { LocationControl } from '../molecules/LocationControl';
import { PanelSection } from '../molecules/PanelSection';
import { StatusMessage } from '../atoms/StatusMessage';
import { MapViewLeaflet } from '../organisms/MapViewLeaflet';
import { HavenResults } from '../organisms/HavenResults';
import { SensoryDashboardLayout } from '../templates/SensoryDashboardLayout';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHavens } from '../hooks/useDataHooks';
import { HAVEN_TYPES } from '../utils/havenTypes';
import { DEFAULT_CENTER } from '../utils/geo';

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todos' },
  ...Object.entries(HAVEN_TYPES).map(([value, t]) => ({ value, label: t.label })),
];

export function HavensPage() {
  useDocumentTitle('Oasis sensoriales');
  const geo = useGeolocation();
  const [picked, setPicked] = useState(null);
  const [type, setType] = useState('all');
  const [wheelchair, setWheelchair] = useState(false);
  const [selected, setSelected] = useState(null);

  const point = picked ?? geo.position ?? DEFAULT_CENTER;
  const query = useHavens(point, 2000);
  const havens = (query.data ?? []).filter(
    (h) => (type === 'all' || h.type === type) && (!wheelchair || h.wheelchair === 'yes'),
  );

  return (
    <SensoryDashboardLayout
      title="Oasis sensoriales"
      englishName="Sensory Havens"
      intro="Parques, jardines, bibliotecas y museos reales de OpenStreetMap a menos de 2 km. Son candidatos: NEURONOTE todavía no ha evaluado su nivel de calma."
      map={
        <MapViewLeaflet
          center={point}
          zoom={14}
          havens={havens}
          selectedHavenId={selected}
          onSelectHaven={setSelected}
          user={geo.position}
          onMapClick={setPicked}
          label="Mapa de oasis sensoriales candidatos"
        />
      }
      panel={
        <>
          <StatusMessage tone="info" title="Cómo leer esta lista">
            Los datos vienen de OpenStreetMap, editado por voluntarios. Un lugar «Sin verificar» existe,
            pero nadie ha documentado todavía su ruido, luz o aforo. Las auditorías llegarán con el motor
            de certificación (Fase 4).
          </StatusMessage>
          <LocationControl geo={geo} />
          <PanelSection id="havens-filters" title="Filtrar">
            <ChoiceGroup
              legend="Tipo de lugar"
              name="havenType"
              variant="segmented"
              options={TYPE_OPTIONS}
              value={type}
              onChange={setType}
            />
            <Switch
              label="Solo accesibles en silla de ruedas"
              description="Según la etiqueta «wheelchair=yes» de OpenStreetMap. Muchos lugares aún no la tienen."
              checked={wheelchair}
              onChange={setWheelchair}
            />
          </PanelSection>
          <PanelSection
            id="havens-list"
            title={query.status === 'success' ? `${havens.length} lugares` : 'Lugares'}
          >
            <HavenResults
              query={query}
              havens={havens}
              origin={point}
              selectedId={selected}
              onSelect={setSelected}
              limit={30}
            />
          </PanelSection>
        </>
      }
    />
  );
}
