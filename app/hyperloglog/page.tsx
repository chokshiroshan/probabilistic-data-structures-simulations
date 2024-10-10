import HyperLogLogPlusPlusSimulation from "@/components/hyperloglog"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function HyperLogLogPage() {
    return (
        <div
            className={`${inter.className}`}
        >
            <HyperLogLogPlusPlusSimulation />
        </div>
    )
}