import { describe, it, expect, afterEach, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { renderApp } from '../utils';
import { NearbyClinics } from '../../src/organisms/NearbyClinics';
import { HeartRatePage } from '../../src/pages/HeartRatePage';
import { SiteFooter } from '../../src/organisms/SiteFooter';

const overpass = (elements) => [
  http.post('https://overpass-api.de/api/interpreter', () => HttpResponse.json({ elements })),
  http.post('https://overpass.kumi.systems/api/interpreter', () => HttpResponse.json({ elements })),
];

describe('Pie de página', () => {
  it('enlaza el panel de auditores y el monitor de pulso', () => {
    renderApp(<SiteFooter />);
    expect(screen.getByRole('link', { name: /Acceso para auditores/ }).getAttribute('href')).toBe(
      'https://neuronote-audit.onrender.com/',
    );
    expect(screen.getByRole('link', { name: /Monitor de pulso/ })).toHaveAttribute('href', '/pulso');
  });
});

describe('Clínicas psicológicas cercanas', () => {
  it('no busca nada hasta que la persona elige dónde', () => {
    renderApp(<NearbyClinics />);
    expect(screen.getByRole('button', { name: 'Buscar cerca de mí' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('muestra lugares reales de OSM ordenados por distancia, sin verificar', async () => {
    server.use(
      ...overpass([
        { type: 'node', id: 2, lat: 19.45, lon: -99.13, tags: { name: 'Lejana Psicología', healthcare: 'psychologist' } },
        { type: 'node', id: 1, lat: 19.433, lon: -99.133, tags: { name: 'Cercana Salud Mental', phone: '+52 55 1111 2222' } },
      ]),
    );
    renderApp(<NearbyClinics />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar en Centro Histórico/ }));
    const items = await screen.findAllByRole('listitem');
    expect(items[0]).toHaveTextContent('Cercana Salud Mental');
    expect(items[1]).toHaveTextContent('Lejana Psicología');
    expect(screen.getAllByText('Sin verificar')).toHaveLength(2);
    expect(screen.getByRole('link', { name: /Llamar a Cercana/ })).toHaveAttribute('href', 'tel:+525511112222');
    expect(screen.getByRole('link', { name: /Cómo llegar a Cercana/ }).getAttribute('href')).toMatch(/^\/rutas\?to=19\.43300/);
    expect(screen.getByRole('link', { name: /Buscar más clínicas en Google Maps/ })).toBeInTheDocument();
  });

  it('si Overpass falla, usa las búsquedas de Nominatim (sin calles ni escuelas)', async () => {
    const down = () => HttpResponse.json({ error: 'busy' }, { status: 504 });
    server.use(
      http.post('https://overpass-api.de/api/interpreter', down),
      http.post('https://overpass.kumi.systems/api/interpreter', down),
      http.get('https://nominatim.openstreetmap.org/search', ({ request }) => {
        const q = new URL(request.url).searchParams.get('q');
        if (q !== 'salud mental') return HttpResponse.json([]);
        return HttpResponse.json([
          { osm_type: 'node', osm_id: 7, lat: '19.434', lon: '-99.134', name: 'Centro de Salud Mental', category: 'amenity', type: 'clinic' },
          { osm_type: 'way', osm_id: 8, lat: '19.434', lon: '-99.134', name: 'Calle Salud Mental', category: 'highway', type: 'residential' },
        ]);
      }),
    );
    renderApp(<NearbyClinics />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar en Centro Histórico/ }));
    const items = await screen.findAllByRole('listitem', {}, { timeout: 10_000 });
    expect(items).toHaveLength(1);
    expect(items[0]).toHaveTextContent('Centro de Salud Mental');
  }, 15_000);

  it('si OSM no tiene datos lo dice con honestidad', async () => {
    server.use(...overpass([]));
    renderApp(<NearbyClinics />);
    await userEvent.click(screen.getByRole('button', { name: /Buscar en Centro Histórico/ }));
    expect(await screen.findByText('No encontramos clínicas registradas cerca')).toBeInTheDocument();
  });
});

describe('Monitor de pulso', () => {
  afterEach(() => vi.useRealTimers());

  it('advierte que no es un dispositivo médico y ofrece el 911', () => {
    renderApp(<HeartRatePage />);
    expect(screen.getByRole('note')).toHaveTextContent('NEURONOTE no es un dispositivo médico');
    expect(screen.getByRole('link', { name: /Emergencias: 911/ })).toHaveAttribute('href', expect.stringMatching(/^tel:/));
  });

  it('sin Bluetooth en el navegador lo explica y permite la demostración', () => {
    renderApp(<HeartRatePage />);
    expect(screen.getByText('Tu navegador no puede conectarse por Bluetooth')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Conectar dispositivo' })).not.toBeInTheDocument();
  });

  it('valida el umbral', async () => {
    renderApp(<HeartRatePage />);
    await userEvent.type(screen.getByLabelText(/Avisarme si mi pulso pasa de/), '30');
    expect(screen.getByText('Escribe un número entero entre 60 y 200 latidos por minuto.')).toBeInTheDocument();
  });

  it('en la demostración avisa con calma cuando el pulso se mantiene alto, y se puede posponer', async () => {
    // Solo se simulan los intervalos (la demostración); userEvent sigue con temporizadores reales
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
    const user = userEvent.setup();
    renderApp(<HeartRatePage />);
    await user.type(screen.getByLabelText(/Avisarme si mi pulso pasa de/), '100');
    await user.click(screen.getByRole('radio', { name: '30 segundos' }));
    await user.click(screen.getByRole('button', { name: 'Probar con datos de demostración' }));
    // 60 tics de 250 ms = 60 s simulados: el pulso sube y se mantiene arriba > 30 s
    await act(async () => {
      vi.advanceTimersByTime(60 * 250);
    });
    expect(screen.getByText('Demostración')).toBeInTheDocument();
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Tu pulso lleva 30 segundos por encima de 100 lpm');
    await user.click(screen.getByRole('button', { name: 'Ya estoy descansando' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Detener demostración' }));
    expect(screen.getByText('Sin dispositivo conectado.')).toBeInTheDocument();
  });

  describe('vibración', () => {
    afterEach(() => {
      delete navigator.vibrate;
    });

    it('sin API de vibración (iPhone) lo explica y no muestra el interruptor', () => {
      renderApp(<HeartRatePage />);
      expect(screen.getByText(/Tu navegador no permite vibrar/)).toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: 'Vibrar al avisar' })).not.toBeInTheDocument();
    });

    it('«Probar vibración» vibra y explica qué revisar si no se siente', async () => {
      navigator.vibrate = vi.fn(() => true);
      renderApp(<HeartRatePage />);
      await userEvent.click(screen.getByRole('button', { name: 'Probar vibración' }));
      expect(navigator.vibrate).toHaveBeenCalledWith([250, 150, 250]);
      expect(screen.getByText(/revisa que tu celular no esté en silencio/)).toBeInTheDocument();
    });

    it('si el navegador bloquea la vibración, lo dice', async () => {
      navigator.vibrate = vi.fn(() => false);
      renderApp(<HeartRatePage />);
      await userEvent.click(screen.getByRole('button', { name: 'Probar vibración' }));
      expect(screen.getByText(/El navegador no permitió vibrar/)).toBeInTheDocument();
    });

    it('vibra al aparecer el aviso y también si se activa con el aviso ya en pantalla', async () => {
      navigator.vibrate = vi.fn(() => true);
      vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      const user = userEvent.setup();
      renderApp(<HeartRatePage />);
      await user.type(screen.getByLabelText(/Avisarme si mi pulso pasa de/), '100');
      await user.click(screen.getByRole('radio', { name: '30 segundos' }));
      await user.click(screen.getByRole('button', { name: 'Probar con datos de demostración' }));
      await act(async () => {
        vi.advanceTimersByTime(60 * 250);
      });
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(navigator.vibrate).not.toHaveBeenCalled(); // interruptor apagado: no vibra

      await user.click(screen.getByRole('switch', { name: 'Vibrar al avisar' }));
      expect(navigator.vibrate).toHaveBeenCalledTimes(1); // se activó con el aviso visible

      await act(async () => {
        vi.advanceTimersByTime(10 * 250);
      });
      expect(navigator.vibrate).toHaveBeenCalledTimes(1); // un solo aviso, una sola vibración
    });
  });
});
