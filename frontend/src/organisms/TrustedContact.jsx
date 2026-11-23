import { useId, useState } from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '../atoms/Button';
import { Switch } from '../atoms/Switch';
import { TextField } from '../atoms/TextField';
import { useCountries } from '../hooks/useDataHooks';
import { describeError } from '../services/http';
import { trustedContactStore } from '../services/trustedContactStore';
import { DEFAULT_SOS_MESSAGE, buildWhatsAppLink, validatePhone, digitsOnly } from '../utils/whatsapp';
import fieldStyles from '../atoms/Field.module.css';
import styles from './TrustedContact.module.css';

/**
 * Escribir por WhatsApp a una persona de confianza (wa.me, sin API de pago).
 * - Código de país desde REST Countries (o escrito a mano si la API no está disponible).
 * - Mensaje preconfigurado y editable: la persona solo pulsa "Enviar" en WhatsApp.
 * - El número se recuerda únicamente con permiso explícito.
 */
export function TrustedContact({ compact = false }) {
  const id = useId();
  const saved = trustedContactStore.load();
  // La lista de países solo se pide en la vista completa: cuida la cuota gratuita de REST Countries
  const countries = useCountries(!compact);
  const [country, setCountry] = useState(saved?.country || 'MX');
  const [manualCode, setManualCode] = useState(saved?.callingCode || '52');
  const [phone, setPhone] = useState(saved?.phone ?? '');
  const [name, setName] = useState(saved?.name ?? '');
  const [message, setMessage] = useState(DEFAULT_SOS_MESSAGE);
  const [remember, setRemember] = useState(!!saved);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(!saved);

  const list = countries.data ?? [];
  const selected = list.find((c) => c.code === country);
  const callingCode = countries.status === 'success' ? digitsOnly(selected?.callingCodes[0]) : digitsOnly(manualCode);

  const open = (e) => {
    const problem = validatePhone(callingCode, phone);
    if (problem) {
      e.preventDefault();
      setError(problem);
      return;
    }
    setError(null);
    if (remember) trustedContactStore.save({ country, callingCode, phone: digitsOnly(phone), name: name.trim() });
    else trustedContactStore.clear();
  };

  const link = buildWhatsAppLink(callingCode, phone, message);

  // Contacto guardado: un solo botón, sin pedir nada más en un momento difícil
  if (saved && !editing) {
    return (
      <div className={styles.box}>
        <a href={buildWhatsAppLink(saved.callingCode, saved.phone, message)} className={styles.wa} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          <span>
            <strong>Escribir a {saved.name || 'mi persona de confianza'}</strong>
            <span className={styles.waSub}>Se abrirá WhatsApp con un mensaje listo para enviar</span>
          </span>
        </a>
        <div className={styles.row}>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Cambiar contacto
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={Trash2}
            iconPosition="start"
            onClick={() => {
              trustedContactStore.clear();
              setRemember(false);
              setPhone('');
              setName('');
              setEditing(true);
            }}
          >
            Olvidar este número
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.box}>
      {!compact && (
        <p className={styles.intro}>
          Abre WhatsApp con un mensaje ya escrito para alguien de tu confianza. NEURONOTE no envía ni
          guarda la conversación.
        </p>
      )}

      <div className={styles.phoneRow}>
        {countries.status === 'success' ? (
          <div className={fieldStyles.field}>
            <label htmlFor={`${id}-country`} className={fieldStyles.label}>
              País
            </label>
            <select
              id={`${id}-country`}
              className={fieldStyles.control}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              {list.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} (+{digitsOnly(c.callingCodes[0])})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <TextField
            label="Código de país"
            hint="Solo números. México: 52."
            inputMode="numeric"
            maxLength={4}
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            className={styles.code}
            required
          />
        )}
        <TextField
          label="Número de WhatsApp"
          hint="Sin el código de país. Ejemplo: 55 1234 5678."
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={20}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError(null);
          }}
          error={error}
          required
        />
      </div>

      {countries.status === 'success' && selected && (
        <p className={styles.countryInfo}>
          {selected.flag} {selected.name} · Idiomas: {selected.languages.join(', ') || '—'} · Moneda:{' '}
          {selected.currencies.join(', ') || '—'}
        </p>
      )}
      {countries.status === 'error' && !compact && (
        <p className={styles.countryInfo}>
          {describeError(countries.error)} Escribe el código de país a mano.
        </p>
      )}

      {!compact && (
        <>
          <TextField label="Nombre o apodo" hint="Para reconocer el botón. No se envía." maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
          <TextField label="Mensaje" multiline maxLength={400} value={message} onChange={(e) => setMessage(e.target.value)} />
        </>
      )}

      <Switch
        label="Recordar este número en este dispositivo"
        description="Así la próxima vez solo pulsas un botón. Se guarda únicamente en este navegador."
        checked={remember}
        onChange={setRemember}
      />

      <a href={link} className={styles.wa} target="_blank" rel="noopener noreferrer" onClick={open}>
        <MessageCircle aria-hidden="true" />
        <span>
          <strong>Abrir WhatsApp</strong>
          <span className={styles.waSub}>Con el mensaje listo; tú decides si lo envías</span>
        </span>
      </a>
    </div>
  );
}
