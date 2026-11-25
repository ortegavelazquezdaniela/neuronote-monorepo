import { describe, it, expect } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../setup';
import { API } from '../msw/handlers';
import { renderApp, fakeSession } from '../utils';
import { HomePage } from '../../src/pages/HomePage';
import { NotesPage } from '../../src/pages/NotesPage';
import { AuthPage } from '../../src/pages/AuthPage';
import { ProfilePage } from '../../src/pages/ProfilePage';
import { RequireAuth } from '../../src/organisms/RequireAuth';
import { MicroclimatePage } from '../../src/pages/MicroclimatePage';
import { HavensPage } from '../../src/pages/HavensPage';
import { HavenDetailPage } from '../../src/pages/HavenDetailPage';
import { RoutesPage } from '../../src/pages/RoutesPage';
import { MapPage } from '../../src/pages/MapPage';
import { SiteHeader } from '../../src/organisms/SiteHeader';
import { SectionPage } from '../../src/pages/SectionPage';
import { NotFoundPage } from '../../src/pages/NotFoundPage';

describe('Página principal y navegación', () => {
  it('muestra el eslogan, los cinco módulos y el mapa', async () => {
    renderApp(<HomePage />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Find your calm.Find your way.');
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent).join(' ')).toMatch(/Sensory Routes.*Sensory Havens.*Microclimate.*Sensory Notes.*SOS Support/);
    expect(screen.getByRole('link', { name: /Línea de la Vida: 800 911 2000/ })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: /Vista previa del mapa/ })).toBeInTheDocument();
  });

  it('el menú móvil abre, cierra con Escape y devuelve el foco', async () => {
    renderApp(<SiteHeader />);
    const toggle = screen.getByRole('button', { name: /Menú/ });
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('páginas informativas: título, resumen y metadatos para buscadores', async () => {
    renderApp(<SectionPage title="Privacidad" intro="Usamos el mínimo de datos." points={['Uno']} />, {
      route: '/privacidad',
    });
    expect(screen.getByRole('heading', { name: 'Privacidad' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'En resumen' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Privacidad · NEURONOTE'));
    const meta = (sel) => document.head.querySelector(sel)?.getAttribute('content');
    expect(meta('meta[name="description"]')).toBe('Usamos el mínimo de datos.');
    expect(meta('meta[property="og:title"]')).toBe('Privacidad · NEURONOTE');
    expect(meta('meta[property="og:url"]')).toBe('https://neuronote-monorepo.vercel.app/privacidad');
    expect(meta('meta[name="robots"]')).toBe('index, follow');
    expect(document.head.querySelector('link[rel="canonical"]').href).toBe(
      'https://neuronote-monorepo.vercel.app/privacidad',
    );
    // No duplica etiquetas al actualizar
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });

  it('404: no se indexa', async () => {
    renderApp(<NotFoundPage />, { route: '/no-existe' });
    expect(screen.getByRole('heading', { name: 'Esta página no existe' })).toBeInTheDocument();
    await waitFor(() =>
      expect(document.head.querySelector('meta[name="robots"]').getAttribute('content')).toBe('noindex, nofollow'),
    );
  });
});

describe('Notas sensoriales (sin cuenta)', () => {
  it('valida, guarda en el navegador, busca y borra con confirmación', async () => {
    renderApp(<NotesPage />);
    expect(await screen.findByText('Todavía no tienes notas')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Guardar nota/ }));
    const summary = screen.getByRole('alert');
    expect(summary).toHaveTextContent('Revisa 3 campos');
    await waitFor(() => expect(summary).toHaveFocus());

    await userEvent.type(screen.getByRole('textbox', { name: /Lugar o trayecto/ }), 'Biblioteca');
    const noise = screen.getByRole('group', { name: /Ruido percibido/ });
    await userEvent.click(within(noise).getByRole('radio', { name: /2/ }));
    const comfort = screen.getByRole('group', { name: /Cómo te sentiste/ });
    await userEvent.click(within(comfort).getByRole('radio', { name: /4/ }));
    await userEvent.click(screen.getByRole('button', { name: /Guardar nota/ }));

    expect(await screen.findByText('Nota guardada')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Biblioteca' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('nn-notes'))).toHaveLength(1);

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar en tus notas' }), 'zzz');
    expect(screen.getByText('Sin coincidencias')).toBeInTheDocument();
    await userEvent.clear(screen.getByRole('searchbox'));

    await userEvent.click(screen.getByRole('button', { name: 'Borrar la nota de Biblioteca' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sí, borrar' }));
    expect(await screen.findByText('Todavía no tienes notas')).toBeInTheDocument();
  });

  it('edita una nota: la abre en el formulario, guarda los cambios y permite cancelar', async () => {
    localStorage.setItem(
      'nn-notes',
      JSON.stringify([
        { id: 'a1', place: 'Parque', when: '2026-11-20T15:00:00.000Z', noise: 2, comfort: 4, light: 'suave', crowd: null, text: 'Sombra', createdAt: '2026-11-20T15:01:00.000Z' },
      ]),
    );
    renderApp(<NotesPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Editar la nota de Parque' }));

    const heading = screen.getByRole('heading', { name: 'Editar nota' });
    await waitFor(() => expect(heading).toHaveFocus());
    const place = screen.getByRole('textbox', { name: /Lugar o trayecto/ });
    expect(place).toHaveValue('Parque');
    expect(within(screen.getByRole('group', { name: /Ruido percibido/ })).getByRole('radio', { name: /2/ })).toBeChecked();

    await userEvent.clear(place);
    await userEvent.type(place, 'Parque Hundido');
    await userEvent.click(within(screen.getByRole('group', { name: /Ruido percibido/ })).getByRole('radio', { name: /4/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(await screen.findByText('Se guardaron los cambios de «Parque Hundido».')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Nueva nota' })).toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem('nn-notes'));
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({ id: 'a1', place: 'Parque Hundido', noise: 4, createdAt: '2026-11-20T15:01:00.000Z' });

    await userEvent.click(screen.getByRole('button', { name: 'Editar la nota de Parque Hundido' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(screen.getByRole('heading', { name: 'Nueva nota' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Lugar o trayecto/ })).toHaveValue('');
  });
});

describe('Cuentas (API)', () => {
  it('la ruta protegida lleva a iniciar sesión', async () => {
    renderApp(<RequireAuth><p>Secreto</p></RequireAuth>, {
      route: '/perfil',
      path: '/perfil',
      routes: [{ path: '/entrar', element: <AuthPage mode="login" /> }],
    });
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
  });

  it('registro: valida en la página y muestra errores del servidor', async () => {
    server.use(http.post(`${API}/auth/register`, () => HttpResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 })));
    renderApp(<AuthPage mode="register" />, { route: '/registro', path: '/registro' });
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByText(/al menos 10 caracteres/)).toBeInTheDocument();

    await userEvent.type(screen.getByRole('textbox', { name: /Nombre o apodo/ }), 'Prueba');
    await userEvent.type(screen.getByRole('textbox', { name: /Correo/ }), 'prueba@neuronote.test');
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'clavesegura2026');
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByText('Ya existe una cuenta con ese correo')).toBeInTheDocument();
  });

  it('inicio de sesión correcto lleva al perfil y guarda la sesión solo en la pestaña', async () => {
    server.use(
      http.post(`${API}/auth/login`, () => HttpResponse.json({ token: 'tok', user: { id: 'u1', email: 'a@b.test', displayName: 'Ana', role: 'user' } })),
      http.get(`${API}/me/profile`, () => HttpResponse.json({ profile: null })),
      http.get(`${API}/me/favorites`, () => HttpResponse.json({ items: [] })),
    );
    renderApp(<AuthPage mode="login" />, {
      route: '/entrar?volver=/perfil',
      path: '/entrar',
      routes: [{ path: '/perfil', element: <ProfilePage /> }],
    });
    await userEvent.type(screen.getByRole('textbox', { name: /Correo/ }), 'a@b.test');
    await userEvent.type(screen.getByLabelText(/Contraseña/), 'loquesea');
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument();
    expect(JSON.parse(sessionStorage.getItem('nn-session')).token).toBe('tok');
    expect(localStorage.getItem('nn-session')).toBeNull();
  });

  it('perfil: guarda el perfil sensorial, quita favoritos y pide confirmación para borrar la cuenta', async () => {
    fakeSession();
    let saved;
    let favs = [{ osmId: 'way-1', name: 'Alameda', lat: 19, lon: -99 }];
    server.use(
      http.get(`${API}/me/profile`, () => HttpResponse.json({ profile: null })),
      http.put(`${API}/me/profile`, async ({ request }) => {
        saved = await request.json();
        return HttpResponse.json({ profile: saved });
      }),
      http.get(`${API}/me/favorites`, () => HttpResponse.json({ items: favs })),
      http.delete(`${API}/me/favorites/way-1`, () => {
        favs = [];
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderApp(<ProfilePage />);
    const noise = await screen.findByRole('group', { name: /Sensibilidad al ruido/ });
    await userEvent.click(within(noise).getByRole('radio', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: /Guardar perfil/ }));
    expect(await screen.findByText('Perfil guardado.')).toBeInTheDocument();
    expect(saved).toMatchObject({ noiseSensitivity: 5, routePriority: 'calm' });

    await userEvent.click(await screen.findByRole('button', { name: 'Quitar Alameda de favoritos' }));
    expect(await screen.findByText('Aún no guardas oasis')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Borrar mi cuenta/ }));
    expect(screen.getByRole('button', { name: 'Sí, borrar mi cuenta' })).toBeInTheDocument();
  });

  it('notas con sesión: se guardan en la cuenta', async () => {
    fakeSession();
    let posted;
    server.use(
      http.get(`${API}/me/notes`, () => HttpResponse.json({ items: [], pages: 1 })),
      http.post(`${API}/me/notes`, async ({ request }) => {
        posted = await request.json();
        return HttpResponse.json({ item: { id: 'n1', ...posted } }, { status: 201 });
      }),
    );
    renderApp(<NotesPage />);
    expect(await screen.findByText(/Se guardan en tu cuenta/)).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: /Lugar o trayecto/ }), 'Museo');
    await userEvent.click(within(screen.getByRole('group', { name: /Ruido percibido/ })).getByRole('radio', { name: /1/ }));
    await userEvent.click(within(screen.getByRole('group', { name: /Cómo te sentiste/ })).getByRole('radio', { name: /5/ }));
    await userEvent.click(screen.getByRole('button', { name: /Guardar nota/ }));
    await waitFor(() => expect(posted).toMatchObject({ place: 'Museo', noise: 1, comfort: 5 }));
    expect(await screen.findByText(/Se guardó en tu cuenta/)).toBeInTheDocument();
    expect(localStorage.getItem('nn-notes')).toBeNull();
  });

  it('notas con sesión: editar envía PUT a la API', async () => {
    fakeSession();
    let put;
    const note = { id: 'n9', place: 'Museo', when: '2026-11-20T15:00:00.000Z', noise: 3, comfort: 3, light: null, crowd: null, text: '' };
    server.use(
      http.get(`${API}/me/notes`, () => HttpResponse.json({ items: [note], pages: 1 })),
      http.put(`${API}/me/notes/n9`, async ({ request }) => {
        put = await request.json();
        return HttpResponse.json({ item: { ...note, ...put } });
      }),
    );
    renderApp(<NotesPage />);
    await userEvent.click(await screen.findByRole('button', { name: 'Editar la nota de Museo' }));
    await userEvent.type(screen.getByRole('textbox', { name: /Nota/ }), 'Mucho eco');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(put).toMatchObject({ place: 'Museo', text: 'Mucho eco' }));
    expect(await screen.findByText('Se guardaron los cambios de «Museo».')).toBeInTheDocument();
  });
});

describe('Páginas geoespaciales (APIs simuladas con MSW)', () => {
  it('Microclima muestra pronóstico etiquetado y tres gráficas', async () => {
    renderApp(<MicroclimatePage />);
    expect(await screen.findByText('21 °C')).toBeInTheDocument();
    expect(screen.getByText('Pronóstico')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByText(/no es un diagnóstico médico/)).toBeInTheDocument();
  });

  it('Microclima: error con reintento', async () => {
    server.use(http.get('https://api.open-meteo.com/v1/forecast', () => new HttpResponse(null, { status: 404 })));
    renderApp(<MicroclimatePage />);
    expect(await screen.findByText('No pudimos consultar el clima')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Intentar de nuevo/ })).toBeInTheDocument();
  });

  it('Oasis: lista lugares reales sin verificar y filtra por tipo', async () => {
    renderApp(<HavensPage />);
    expect(await screen.findByRole('button', { name: 'Parque de Prueba' }, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getAllByText('Sin verificar').length).toBeGreaterThan(0);
    await userEvent.click(screen.getByRole('radio', { name: 'Biblioteca' }));
    expect(screen.queryByRole('button', { name: 'Parque de Prueba' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('switch', { name: /silla de ruedas/ }));
    expect(screen.getByText('No encontramos lugares con estos filtros')).toBeInTheDocument();
  }, 15000);

  it('Ficha de oasis: datos de OSM y aviso de que no tiene auditoría', async () => {
    renderApp(<HavenDetailPage />, { route: '/oasis/node-2002', path: '/oasis/:id' });
    expect(await screen.findByRole('heading', { name: 'Biblioteca de Prueba' }, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText('Mo-Fr 09:00-18:00')).toBeInTheDocument();
    expect(await screen.findByText(/Sin auditoría de NEURONOTE/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Planear ruta hasta aquí/ }).getAttribute('href')).toMatch(/^\/rutas\?to=19\.434/);
  }, 15000);

  it('Rutas: con destino calcula alternativas reales y permite priorizar', async () => {
    renderApp(<RoutesPage />, { route: '/rutas?to=19.436,-99.144&name=Alameda', path: '/rutas' });
    expect(await screen.findByText('2 rutas encontradas', {}, { timeout: 8000 })).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /Menor tiempo a pie/ }));
    expect(screen.getAllByText(/Ruido: aún sin reportes/)).toHaveLength(2);
  }, 15000);

  it('Mapa: muestra microclima y lugares cercanos', async () => {
    renderApp(<MapPage />);
    expect(await screen.findByRole('region', { name: 'Mapa de oasis sensoriales candidatos' })).toBeInTheDocument();
    // La cola de Nominatim (1 petición/s) puede arrastrar consultas de pruebas anteriores
    expect(await screen.findByRole('button', { name: 'Parque de Prueba' }, { timeout: 20000 })).toBeInTheDocument();
    expect(screen.getByText('Pronóstico')).toBeInTheDocument();
  }, 30000);
});
