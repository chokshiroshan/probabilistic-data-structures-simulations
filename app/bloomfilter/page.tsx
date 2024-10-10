import BloomFilterSimulation from "@/components/bloomfilter"
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function BloomFilterPage() {
    return (
            <div
            className={`${inter.className}`}
        >
            <BloomFilterSimulation />
        </div>
    )
}