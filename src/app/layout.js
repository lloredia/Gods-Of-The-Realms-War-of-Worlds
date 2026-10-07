import './globals.css';
import NavBar from '../components/NavBar';
import { publicPath } from '../utils/publicPath';

const repository = process.env.GITHUB_REPOSITORY || 'lloredia/Gods-Of-The-Realms-War-of-Worlds';
const owner = repository.split('/')[0];
const metadataBase =
  process.env.GITHUB_PAGES === 'true'
    ? new URL(`https://${owner}.github.io`)
    : new URL('http://localhost:3000');

export const metadata = {
  metadataBase,
  title: 'GOTR — Gods Of The Realms: War of Worlds',
  description: 'Gods Of The Realms — War of Worlds',
  icons: {
    icon: publicPath('/assets/logo.jpg'),
    apple: publicPath('/assets/logo.jpg'),
  },
  openGraph: {
    title: 'Gods Of The Realms — War of Worlds',
    description: 'Mobile-style gacha RPG · turn-meter combat · five pantheons collide',
    images: [publicPath('/assets/logo.jpg')],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
