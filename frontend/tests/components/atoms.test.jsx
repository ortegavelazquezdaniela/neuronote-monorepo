import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { Leaf } from 'lucide-react';
import { Button } from '../../src/atoms/Button';
import { DataBadge } from '../../src/atoms/DataBadge';
import { Logo } from '../../src/atoms/Logo';
import { TextField } from '../../src/atoms/TextField';
import { Switch } from '../../src/atoms/Switch';
import { StatusMessage } from '../../src/atoms/StatusMessage';
import { SkipLink } from '../../src/atoms/SkipLink';
import { PageLoader } from '../../src/atoms/PageLoader';
import { ChoiceGroup } from '../../src/molecules/ChoiceGroup';
import { EmptyState } from '../../src/molecules/EmptyState';
import { LayerToggle } from '../../src/molecules/LayerToggle';
import { RouteCompare } from '../../src/molecules/RouteCompare';
import { PanelSection } from '../../src/molecules/PanelSection';
import { MiniLineChart } from '../../src/molecules/MiniLineChart';
import { HavenList } from '../../src/molecules/HavenList';
import { CityMap } from '../../src/organisms/CityMap';

describe('Átomos', () => {
  it('Button se convierte en enlace interno, externo o botón', () => {
    render(
      <MemoryRouter>
        <Button to="/rutas">Interno</Button>
        <Button href="tel:911">Externo</Button>
        <Button onClick={() => {}}>Acción</Button>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Interno' })).toHaveAttribute('href', '/rutas');
    expect(screen.getByRole('link', { name: 'Externo' })).toHaveAttribute('href', 'tel:911');
    expect(screen.getByRole('button', { name: 'Acción' })).toHaveAttribute('type', 'button');
  });

  it('DataBadge siempre declara la procedencia del dato', () => {
    render(<><DataBadge kind="forecast" /><DataBadge kind="desconocido" /></>);
    expect(screen.getByText('Pronóstico')).toHaveAttribute('title', expect.stringMatching(/Open-Meteo/));
    expect(screen.getByText('Demostración')).toBeInTheDocument();
  });

  it('Logo, SkipLink y PageLoader', async () => {
    render(<><Logo inverted /><SkipLink /><PageLoader /></>);
    expect(screen.getByText('NEURO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido principal' })).toHaveAttribute('href', '#contenido');
    expect(await screen.findByText('Cargando la página…', {}, { timeout: 1000 })).toBeInTheDocument();
  });

  it('TextField vincula pista, error y contador al campo', () => {
    render(<TextField label="Lugar" hint="Ejemplo" error="Falta" maxLength={10} value="hola" onChange={() => {}} required />);
    const input = screen.getByRole('textbox', { name: /Lugar/ });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Ejemplo.*Falta.*4 de 10/);
  });

  it('Switch usa role="switch" con estado', async () => {
    const onChange = vi.fn();
    render(<Switch label="Recordar" description="Solo aquí" checked={false} onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Recordar' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('StatusMessage: errores como alert, éxitos como status', () => {
    render(<><StatusMessage tone="error" title="Mal" /><StatusMessage tone="success" title="Bien">Detalle</StatusMessage></>);
    expect(screen.getByRole('alert')).toHaveTextContent('Mal');
    expect(screen.getByRole('status')).toHaveTextContent('BienDetalle');
  });
});

describe('Moléculas', () => {
  it('ChoiceGroup: radios nativos, marca de obligatorio y error', async () => {
    const onChange = vi.fn();
    render(
      <ChoiceGroup legend="Ruido" name="n" variant="scale" scaleLabels={['Bajo', 'Alto']} required error="Elige uno"
        options={[{ value: 1, label: '1' }, { value: 2, label: '2', description: 'Medio' }]} value={null} onChange={onChange} />,
    );
    expect(screen.getByRole('group', { name: /Ruido \(obligatorio\)/ })).toHaveAttribute('aria-invalid', 'true');
    await userEvent.click(screen.getByRole('radio', { name: /2/ }));
    expect(onChange).toHaveBeenCalledWith(2);
    expect(screen.getByText('Elige uno')).toBeInTheDocument();
  });

  it('EmptyState, LayerToggle, PanelSection y RouteCompare', async () => {
    const onToggle = vi.fn();
    render(
      <>
        <EmptyState icon={Leaf} title="Nada aún" action={<button>Crear</button>}>Texto</EmptyState>
        <LayerToggle pressed onToggle={onToggle} swatch="havens">Oasis</LayerToggle>
        <PanelSection id="p" title="Sección">contenido</PanelSection>
        <RouteCompare />
      </>,
    );
    expect(screen.getByText('Nada aún')).toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /Oasis/ });
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(toggle);
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByRole('region', { name: 'Sección' })).toBeInTheDocument();
    expect(screen.getByLabelText('Comparación de rutas de ejemplo')).toHaveTextContent('Demostración');
  });

  it('MiniLineChart se recorre con el teclado y ofrece tabla', async () => {
    const data = Array.from({ length: 12 }, (_, i) => ({ time: `2026-11-22T${String(i).padStart(2, '0')}:00`, value: 10 + i }));
    render(<MiniLineChart title="Temperatura" unit="°C" data={data} nowTime="2026-11-22T05:00" />);
    const chart = screen.getByRole('img', { name: 'Temperatura' });
    chart.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText('02 h: 12,0 °C')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getAllByRole('row')).toHaveLength(13);
    expect(screen.getByText('Ahora')).toBeInTheDocument();
  });

  it('HavenList ordena por cercanía y enlaza a la ficha', async () => {
    const onSelect = vi.fn();
    const havens = [
      { id: 'way-2', name: 'Lejos', type: 'park', lat: 19.45, lon: -99.13, wheelchair: 'yes' },
      { id: 'node-1', name: 'Cerca', type: 'library', lat: 19.4331, lon: -99.1331, wheelchair: null },
    ];
    render(<MemoryRouter><HavenList havens={havens} origin={{ lat: 19.433, lon: -99.133 }} onSelect={onSelect} /></MemoryRouter>);
    const names = screen.getAllByRole('button').map((b) => b.textContent);
    expect(names).toEqual(['Cerca', 'Lejos']);
    await userEvent.click(screen.getByRole('button', { name: 'Cerca' }));
    expect(onSelect).toHaveBeenCalledWith('node-1');
    expect(screen.getByRole('link', { name: /Ver ficha de Lejos/ })).toHaveAttribute('href', '/oasis/way-2');
    expect(screen.getByText(/Accesible en silla de ruedas/)).toBeInTheDocument();
  });

  it('CityMap oculta capas', () => {
    const { container, rerender } = render(<CityMap />);
    const count = container.querySelectorAll('path').length;
    rerender(<CityMap layers={{ routes: false, havens: false, climate: false }} />);
    expect(container.querySelectorAll('path').length).toBeLessThan(count);
  });
});
