export const currentUser = {
  name: 'Léa',
  fullName: 'Léa Bonnaire',
  email: 'lea.bonnaire@gmail.com',
  dateLine: 'Jeudi 21 mai · 09 h 24',
};

export type DeviceKind = 'laptop' | 'phone';

export const activeSessions: {
  id: string;
  device: DeviceKind;
  label: string;
  meta: string;
  current: boolean;
}[] = [
  {
    id: 'this',
    device: 'laptop',
    label: 'MacBook Air · Safari',
    meta: 'Paris, France · Actif il y a quelques secondes',
    current: true,
  },
  {
    id: 'iphone',
    device: 'phone',
    label: 'iPhone · Application',
    meta: 'Paris, France · Actif il y a 2 h',
    current: false,
  },
  {
    id: 'windows',
    device: 'laptop',
    label: 'Chrome sur Windows',
    meta: 'Lyon, France · Dernière activité 14 mai',
    current: false,
  },
];
