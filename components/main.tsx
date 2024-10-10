"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

const dataStructures = [
  {
    name: 'Bloom Filter',
    description: 'Space-efficient probabilistic set membership testing',
    image: '/bloomfilter.webp',
  },
  {
    name: 'Count-min Sketch',
    description: 'Frequency estimation in data streams',
    image: '/count-min-sketch.webp',
  },
  {
    name: 'HyperLogLog++',
    description: 'Cardinality estimation of large datasets',
    image: '/hyperloglog.webp',
  },
]
const useTypewriter = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayedText(text.slice(0, displayedText.length + 1))
    }, speed)

    if (displayedText === text) {
      clearTimeout(timer)
    }

    return () => clearTimeout(timer)
  }, [text, displayedText, speed])

  return displayedText
}

export default function MainPage() {
  const animatedTitle = useTypewriter('More Coming Soon!')
  const animatedDescription = useTypewriter("I'm working on additional probabilistic data structure simulations. Stay tuned!")
  const router = useRouter();

  const handleCardClick = (name: string) => {
    
    if (name === 'Bloom Filter') {
      router.push('/bloomfilter')
    }
    else if (name === 'Count-min Sketch') {
      router.push('/count-min-sketch')
    }
    else if (name === 'HyperLogLog++') {
      router.push('/hyperloglog')
    }
  }

  return (
    <div className={`max-w-4xl mx-auto min-h-screen p-4 space-y-6 relative`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 mt-8"
      >
        <h1 className={`text-4xl font-bold text-gray-800 mb-4`}>
          Probabilistic Data Structure Simulations
        </h1>
        <p className={`text-xl text-gray-600`}>
          Choose a data structure to explore its simulation
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {dataStructures.map((structure, index) => (
          <motion.div
            key={structure.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardClick(structure.name)}
              className={`relative h-64 bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer`}
            >
              <Image
                src={structure.image}
                alt={structure.name}
                objectFit="cover"
                className="w-full h-auto transition-transform duration-300 transform hover:scale-110"
                style={{
                  position: 'relative',
                }}
                width={300}
                height={200}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-end p-4 transition-opacity duration-300 hover:bg-opacity-75">
                <h2 className="text-2xl font-bold mb-2 text-white">{structure.name}</h2>
                <p className="text-sm text-gray-200">{structure.description}</p>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div className="h-20"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mb-12 mt-12"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {animatedTitle}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {animatedDescription}
        </p>
      </motion.div>
      <div className="h-20"></div>
      <Footer />
      
    </div> 
  )
}