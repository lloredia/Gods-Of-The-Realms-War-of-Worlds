import "./globals.css";
import NavBar from '../components/NavBar';

export const metadata = {
  title: "GOTR — Gods Of The Realms: War of Worlds",
  description: "Gods Of The Realms — War of Worlds",
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
