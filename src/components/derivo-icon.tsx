import Svg, { Circle, Path, Rect } from 'react-native-svg';

type IconName =
  | 'warning'
  | 'link'
  | 'headset'
  | 'settings'
  | 'play'
  | 'pause'
  | 'close'
  | 'chevron-up'
  | 'chevron-down'
  | 'refresh'
  | 'clock'
  | 'user'
  | 'help'
  | 'edit'
  | 'check'
  | 'info'
  | 'phone'
  | 'whatsapp'
  | 'home'
  | 'time'
  | 'person'
  | 'logout'
  | 'key';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
};

const paths: Record<Exclude<IconName, 'play' | 'pause' | 'warning' | 'user' | 'whatsapp'>, string> = {
  link: 'M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 19.07l1.72-1.72',
  headset: 'M3 14v-3a9 9 0 0 1 18 0v3M3 14v3a2 2 0 0 0 2 2h2v-7H5a2 2 0 0 0-2 2Zm18 0v3a2 2 0 0 1-2 2h-2v-7h2a2 2 0 0 1 2 2Z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2m10-10h-2M4 12H2m17.07-7.07-1.42 1.42M6.35 17.65l-1.42 1.42m14.14 0-1.42-1.42M6.35 6.35 4.93 4.93',
  close: 'm18 6-12 12M6 6l12 12',
  'chevron-up': 'm6 15 6-6 6 6',
  'chevron-down': 'm6 9 6 6 6-6',
  refresh: 'M20 7v5h-5M4 17v-5h5m-4.1-3A8 8 0 0 1 18.3 6L20 12M4 12l1.7 6A8 8 0 0 0 19.1 15',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
  help: 'M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3m.1 4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  edit: 'm12 20 9-9-3-3-9 9-1 4 4-1ZM15 8l3 3M5 5h6M5 9h3M5 13h3M5 17h3',
  check: 'm5 12 4 4L19 6',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14h.01M11 12h1v5h1',
  phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8L7.7 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.5 2.8Z',
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z',
  time: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-16v6l4 2',
  person: 'M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  logout: 'M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7',
  key: 'M21 2l-2 2m-7.6 7.6a5.5 5.5 0 1 1-7.8 7.8 5.5 5.5 0 0 1 7.8-7.8Zm0 0L16 7m0 0 3 3m-3-3 3-3',
};

export function DerivoIcon({ name, size = 20, color = '#FFFFFF' }: Props) {
  if (name === 'play') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l11.2-7.2a1 1 0 0 0 0-1.72L8.5 3.94A1 1 0 0 0 7 4.8Z" />
      </Svg>
    );
  }
  if (name === 'pause') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <Rect x="6" y="4" width="4" height="16" rx="1" />
        <Rect x="14" y="4" width="4" height="16" rx="1" />
      </Svg>
    );
  }
  if (name === 'warning') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M10.3 4.2 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" fill="none" stroke={color} strokeWidth="1.8" />
        <Path d="M12 9v4m0 3h.01" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'user') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth="1.8" />
        <Path d="M4 21a8 8 0 0 1 16 0" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'whatsapp') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20l.8-4.7A8.5 8.5 0 1 1 20.5 11.8Z" fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
        <Path d="M9 8.3c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .3-.2 1.3-.9 1.7-.6.5-1.4.6-2.2.3-1.1-.4-2.5-1-3.9-2.4-1.4-1.4-2-2.8-2.4-3.9-.3-.8-.2-1.6.3-2.2.3-.5.8-.7 1-.7Z" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d={paths[name]}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
