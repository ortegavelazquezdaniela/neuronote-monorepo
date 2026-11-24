import { RotateCcw } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Switch } from '../atoms/Switch';
import { StatusMessage } from '../atoms/StatusMessage';
import { ChoiceGroup } from '../molecules/ChoiceGroup';
import { usePageMeta } from '../hooks/usePageMeta';
import { usePreferences } from '../hooks/usePreferences';
import styles from './AccessibilityPage.module.css';

const Swatches = ({ colors }) => (
  <span className={styles.swatches}>
    {colors.map((c) => (
      <span key={c} style={{ background: c }} />
    ))}
  </span>
);

const THEMES = [
  {
    value: 'default',
    label: 'Predeterminado',
    description: 'Blancos cálidos y azul profundo.',
    preview: <Swatches colors={['#fbf8f3', '#184077', '#5aa2ab']} />,
  },
  {
    value: 'calm',
    label: 'Modo Calma',
    description: 'Colores más suaves, menos elementos y sin animaciones.',
    preview: <Swatches colors={['#f4f2ec', '#345c61', '#97b1a6']} />,
  },
  {
    value: 'contrast',
    label: 'Alto contraste',
    description: 'Contraste máximo y foco muy visible.',
    preview: <Swatches colors={['#ffffff', '#000000', '#f5c63c']} />,
  },
  {
    value: 'night',
    label: 'Modo Noche',
    description: 'Fondos oscuros y acentos moderados.',
    preview: <Swatches colors={['#0f1a2a', '#5aa2ab', '#ffd9d4']} />,
  },
];

const TEXT_SIZES = [
  { value: 1, label: '100 %' },
  { value: 1.125, label: '112 %' },
  { value: 1.25, label: '125 %' },
  { value: 1.5, label: '150 %' },
];

const FONTS = [
  {
    value: 'atkinson',
    label: 'Atkinson Hyperlegible',
    description: 'Diseñada para distinguir bien letras parecidas.',
    labelStyle: { fontFamily: "'Atkinson Hyperlegible Next'" },
  },
  {
    value: 'opendyslexic',
    label: 'OpenDyslexic',
    description: 'Letras con base más pesada. A algunas personas les ayuda.',
    labelStyle: { fontFamily: "'OpenDyslexic'" },
  },
  {
    value: 'system',
    label: 'Fuente del sistema',
    description: 'La misma que usa tu dispositivo.',
    labelStyle: { fontFamily: 'system-ui' },
  },
];

const MOTION = [
  { value: 'system', label: 'Como mi sistema', description: 'Sigue el ajuste de tu dispositivo.' },
  { value: 'reduced', label: 'Reducir', description: 'Sin desplazamientos; solo cambios inmediatos.' },
  { value: 'full', label: 'Permitir', description: 'Transiciones suaves y breves.' },
];

export function AccessibilityPage() {
  usePageMeta({
    title: 'Preferencias de accesibilidad',
    description:
      'Ajusta NEURONOTE a ti: modo calma, alto contraste, modo noche, fuente para dislexia, tamaño de texto y movimiento reducido.',
  });
  const { prefs, update, reset, saveError } = usePreferences();

  return (
    <section className={`wrap ${styles.page}`} aria-labelledby="a11y-title">
      <header className={styles.header}>
        <h1 id="a11y-title" className={styles.title}>
          Preferencias de accesibilidad
        </h1>
        <p className={styles.intro}>
          Los cambios se aplican al momento en toda la plataforma. No hay una configuración correcta:
          prueba y quédate con la que te resulte cómoda.
        </p>
      </header>

      <form className={styles.form} onSubmit={(e) => e.preventDefault()} aria-label="Preferencias">
        <ChoiceGroup
          legend="Modo visual"
          name="theme"
          options={THEMES}
          value={prefs.theme}
          onChange={(theme) => update({ theme })}
        />

        <ChoiceGroup
          legend="Tamaño del texto"
          name="textScale"
          variant="segmented"
          options={TEXT_SIZES}
          value={prefs.textScale}
          onChange={(textScale) => update({ textScale })}
        />

        <ChoiceGroup
          legend="Tipografía"
          hint="Ninguna fuente es mejor para todas las personas neurodivergentes."
          name="font"
          options={FONTS}
          value={prefs.font}
          onChange={(font) => update({ font })}
        />

        <ChoiceGroup
          legend="Movimiento"
          hint={prefs.theme === 'calm' ? 'El Modo Calma siempre reduce el movimiento.' : undefined}
          name="motion"
          options={MOTION}
          value={prefs.motion}
          onChange={(motion) => update({ motion })}
        />

        <div className={styles.switches}>
          <Switch
            label="Introducción de bienvenida"
            description="Una animación breve (menos de 2 segundos) al abrir NEURONOTE. Nunca se muestra con movimiento reducido."
            checked={prefs.intro}
            onChange={(intro) => update({ intro })}
          />
          <Switch
            label="Recordar en este dispositivo"
            description="Guarda estas preferencias solo en este navegador. Si lo desactivas, se borran de inmediato."
            checked={prefs.remember}
            onChange={(remember) => update({ remember })}
          />
        </div>

        {saveError && prefs.remember && (
          <StatusMessage tone="error" title="No pudimos guardar tus preferencias">
            Este navegador no permite guardar datos (por ejemplo, en modo privado). Tus ajustes siguen
            aplicados mientras la pestaña esté abierta.
          </StatusMessage>
        )}

        <div className={styles.actions}>
          <Button variant="secondary" icon={RotateCcw} iconPosition="start" onClick={reset}>
            Restablecer valores
          </Button>
        </div>
      </form>
    </section>
  );
}
