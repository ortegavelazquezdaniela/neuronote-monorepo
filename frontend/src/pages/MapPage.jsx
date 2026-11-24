import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../atoms/Button';
import { LayerToggle } from '../molecules/LayerToggle';
import { LocationControl } from '../molecules/LocationControl';
import { PanelSection } from '../molecules/PanelSection';
import { MapViewLeaflet } from '../organisms/MapViewLeaflet';
import { MicroclimatePanel } from '../organisms/MicroclimatePanel';
import { HavenResults } from '../organisms/HavenResults';
import { SensoryDashboardLayout } from '../templates/SensoryDashboardLayout';
import { usePageMeta } from '../hooks/usePageMeta';
import { useGeolocation } from '../hooks/useGeolocation';
import { useHavens } from '../hooks/useDataHooks';
import { DEFAULT_CENTER } from '../utils/geo';

export function MapPage() {
  usePageMeta({
    title: 'Explorar mapa',
    description:
      'Mapa de OpenStreetMap con lugares públicos donde podrías descansar y el clima de la zona. Cada dato indica de dónde viene.',
  });
  const geo = useGeolocation();
  const [picked, setPicked] = useState(null);
  const [showHavens, setShowHavens] = useState(true);
  const [selected, setSelected] = useState(null);

  // Prioridad: punto elegido en el mapa → ubicación compartida → centro por defecto
  const point = picked ?? geo.position ?? DEFAULT_CENTER;
  const label = picked ? 'Punto elegido' : geo.position ? 'Tu zona' : DEFAULT_CENTER.label;
  const havensQuery = useHavens(point);
  const havens = havensQuery.data ?? [];

  return (
    <SensoryDashboardLayout
      title="Explorar mapa"
      intro="Lugares públicos que podrían servirte para descansar y el clima de la zona. Haz clic en el mapa para explorar otro punto."
      map={
        <MapViewLeaflet
          center={point}
          havens={showHavens ? havens : []}
          selectedHavenId={selected}
          onSelectHaven={setSelected}
          user={geo.position}
          onMapClick={setPicked}
          label="Mapa de oasis sensoriales candidatos"
        />
      }
      panel={
        <>
          <LocationControl geo={geo} />
          {picked && (
            <Button size="sm" variant="ghost" onClick={() => setPicked(null)}>
              Volver a {geo.position ? 'mi ubicación' : DEFAULT_CENTER.label}
            </Button>
          )}

          <PanelSection id="map-climate" title="Microclima">
            <MicroclimatePanel point={point} placeLabel={label} compact />
          </PanelSection>

          <PanelSection
            id="map-havens"
            title="Lugares para descansar cerca"
            actions={
              <LayerToggle swatch="havens" pressed={showHavens} onToggle={() => setShowHavens((v) => !v)}>
                En el mapa
              </LayerToggle>
            }
          >
            <HavenResults
              query={havensQuery}
              havens={havens}
              origin={point}
              selectedId={selected}
              onSelect={setSelected}
              limit={6}
            />
            <Button to="/oasis" variant="secondary" size="sm" icon={ArrowRight}>
              Ver todos los oasis
            </Button>
          </PanelSection>
        </>
      }
    />
  );
}
