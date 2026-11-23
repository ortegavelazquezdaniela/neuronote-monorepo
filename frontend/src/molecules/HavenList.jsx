import { Link } from 'react-router';
import { Accessibility, ArrowRight, BookOpen, Landmark, Trees, Flower2 } from 'lucide-react';
import { DataBadge } from '../atoms/DataBadge';
import { HAVEN_TYPES } from '../services/overpass';
import { distanceMeters, formatDistance } from '../utils/geo';
import styles from './HavenList.module.css';

const TYPE_ICON = { park: Trees, garden: Flower2, library: BookOpen, museum: Landmark };
const WHEELCHAIR = { yes: 'Accesible en silla de ruedas', limited: 'Accesibilidad limitada', no: 'Sin acceso en silla de ruedas' };

/**
 * Lista accesible de lugares candidatos: alternativa en texto al mapa
 * (los lectores de pantalla y el teclado no dependen de los marcadores).
 */
export function HavenList({ havens, origin, selectedId, onSelect, limit = 12 }) {
  const sorted = origin
    ? [...havens].sort((a, b) => distanceMeters(origin, a) - distanceMeters(origin, b))
    : havens;

  return (
    <ul className={styles.list}>
      {sorted.slice(0, limit).map((h) => {
        const Icon = TYPE_ICON[h.type] ?? Trees;
        return (
          <li key={h.id} className={`${styles.item} ${h.id === selectedId ? styles.selected : ''}`}>
            <span className={styles.icon} data-type={h.type} aria-hidden="true">
              <Icon />
            </span>
            <div className={styles.body}>
              <p className={styles.name}>
                <button type="button" className={styles.select} onClick={() => onSelect?.(h.id)}>
                  {h.name}
                </button>
              </p>
              <p className={styles.meta}>
                {HAVEN_TYPES[h.type]?.label}
                {origin && <> · a {formatDistance(distanceMeters(origin, h))}</>}
                {h.wheelchair && WHEELCHAIR[h.wheelchair] && (
                  <span className={styles.access}>
                    <Accessibility aria-hidden="true" /> {WHEELCHAIR[h.wheelchair]}
                  </span>
                )}
              </p>
              <div className={styles.foot}>
                <DataBadge kind="unverified" />
                <Link to={`/oasis/${h.id}`} className={styles.more}>
                  Ver ficha <span className="visually-hidden">de {h.name}</span>
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
