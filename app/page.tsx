import MainPage from "@/components/main";
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
export default function Home() {
  return (
    <div
      className={`${inter.className}`}
    >
      <MainPage />
    </div>
  );
}
