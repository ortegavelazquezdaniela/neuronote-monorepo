import { describe, it, expect } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../utils';
import { SosFab } from '../../src/organisms/SosFab';
import { AccessibilityPage } from '../../src/pages/AccessibilityPage';
import { CrisisHelpPage } from '../../src/pages/CrisisHelpPage';
import { BrandIntro } from '../../src/organisms/BrandIntro';

describe('SOS', () => {
  it('Alt + C abre el modal desde cualquier pantalla, con el foco en el título', async () => {
    renderApp(<p>Página cualquiera</p>);
    fireEvent.keyDown(document, { code: 'KeyC', altKey: true });
    const dialog = await screen.findByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('open');
    expect(within(dialog).getByRole('heading', { level: 2, hidden: true })).toHaveFocus();
    expect(within(dialog).getByRole('link', { name: /Línea de la Vida/, hidden: true })).toHaveAttribute('href', 'tel:+528009112000');
  });

  it('el botón flotante abre el modal y "Cerrar" lo cierra', async () => {
    renderApp(<SosFab />);
    await userEvent.click(screen.getByRole('button', { name: /Ayuda SOS/ }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('open');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar', hidden: true }));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('la página SOS arma el enlace de WhatsApp con el país elegido (REST Countries vía API)', async () => {
    renderApp(<CrisisHelpPage />);
    const country = await screen.findByRole('combobox', { name: 'País' });
    expect(country).toHaveValue('MX');
    expect(screen.getByText(/peso mexicano/)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/Número de WhatsApp/), '5512345678');
    const link = screen.getByRole('link', { name: /Abrir WhatsApp/ });
    expect(link.getAttribute('href')).toMatch(/^https:\/\/wa\.me\/525512345678\?text=/);
    expect(await screen.findByText('Aún no hay profesionales verificados')).toBeInTheDocument();
  });

  it('no abre WhatsApp si falta el número', async () => {
    renderApp(<CrisisHelpPage />);
    await screen.findByRole('combobox', { name: 'País' });
    await userEvent.click(screen.getByRole('link', { name: /Abrir WhatsApp/ }));
    expect(screen.getByText('Escribe el número de teléfono.')).toBeInTheDocument();
  });
});

describe('Preferencias de accesibilidad', () => {
  it('aplica modo, tamaño de texto y fuente al instante, sin guardar sin permiso', async () => {
    renderApp(<AccessibilityPage />);
    await userEvent.click(screen.getByRole('radio', { name: /Modo Noche/ }));
    await userEvent.click(screen.getByRole('radio', { name: '125 %' }));
    await userEvent.click(screen.getByRole('radio', { name: /OpenDyslexic/ }));
    const root = document.documentElement;
    expect(root.dataset.theme).toBe('night');
    expect(root.dataset.font).toBe('opendyslexic');
    expect(root.style.getPropertyValue('--text-scale')).toBe('1.25');
    expect(localStorage.getItem('nn-prefs')).toBeNull();
  });

  it('guarda solo al activar "Recordar" y el Modo Calma reduce el movimiento', async () => {
    renderApp(<AccessibilityPage />);
    await userEvent.click(screen.getByRole('radio', { name: /Modo Calma/ }));
    await userEvent.click(screen.getByRole('switch', { name: 'Recordar en este dispositivo' }));
    expect(JSON.parse(localStorage.getItem('nn-prefs'))).toMatchObject({ theme: 'calm', remember: true });
    expect(document.documentElement.dataset.motion).toBe('reduced');
    await userEvent.click(screen.getByRole('button', { name: /Restablecer/ }));
    expect(document.documentElement.dataset.theme).toBe('default');
    await userEvent.click(screen.getByRole('switch', { name: 'Recordar en este dispositivo' }));
    expect(localStorage.getItem('nn-prefs')).toBeNull();
  });
});

describe('Intro de marca', () => {
  it('se puede omitir y no vuelve a salir en la misma sesión', async () => {
    const { unmount } = renderApp(<BrandIntro />);
    await userEvent.click(screen.getByRole('button', { name: 'Omitir introducción' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Omitir introducción' })).not.toBeInTheDocument());
    unmount();
    renderApp(<BrandIntro />);
    expect(screen.queryByRole('button', { name: 'Omitir introducción' })).not.toBeInTheDocument();
  });
});
