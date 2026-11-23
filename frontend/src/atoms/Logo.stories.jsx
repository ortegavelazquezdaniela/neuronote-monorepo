import { Logo, LogoMark } from './Logo';

export default { title: 'Átomos/Logo', component: Logo };

export const Normal = {};
export const SobreAzul = {
  render: () => (
    <div style={{ background: 'var(--nn-deep-blue)', padding: '1.5rem', borderRadius: '1rem' }}>
      <Logo inverted />
    </div>
  ),
};
export const Simbolo = { render: () => <LogoMark size={72} /> };
