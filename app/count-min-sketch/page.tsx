import CountMinSketchSimulation from "@/components/countminsketch"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function CountMinSketchPage() {
    return (
        <div
            className={`${inter.className}`}
        >
            <CountMinSketchSimulation />
        </div>
    )
}