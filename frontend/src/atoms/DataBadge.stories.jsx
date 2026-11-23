import { DataBadge, DATA_KINDS } from './DataBadge';

export default {
  title: 'Átomos/DataBadge',
  component: DataBadge,
  argTypes: { kind: { control: 'select', options: Object.keys(DATA_KINDS) } },
  args: { kind: 'forecast' },
};

export const Individual = {};

/** Todas las procedencias de dato que la app distingue. */
export const Todas = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {Object.keys(DATA_KINDS).map((k) => (
        <DataBadge key={k} kind={k} />
      ))}
    </div>
  ),
};
