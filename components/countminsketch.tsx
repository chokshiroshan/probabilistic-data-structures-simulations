"use client"

import { useState, useCallback, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Hash, PlusCircle, Search, ChevronDown, ChevronUp, ArrowLeft, BookOpenCheck, Briefcase } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

const hashFunctions = {
  'xxHash (xxh3)': {
    func: (str: string) => {
      let h = 0xdeadbeef
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x9e3779b1)
      }
      return Math.abs(h)
    },
    description: "A fast, non-cryptographic hash function with excellent distribution and performance for short keys."
  },
  'MurmurHash': {
    func: (str: string) => {
      let h = 0xdeadbeef
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x5bd1e995)
        h = h ^ (h >>> 13)
      }
      return Math.abs(h)
    },  
    description: "A non-cryptographic hash function suitable for general hash-based lookup. It's fast and has good collision resistance."
  },
  'CityHash': {
    func: (str: string) => {
      let h = 0x9ae16a3b2f90404f
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x9ddfea08eb382d69)
      }
      return Math.abs(h)
    },
    description: "Designed for string keys, it's particularly fast for short strings. Often used in hash tables and bloom filters."
  },
  'FarmHash': {
    func: (str: string) => {
      let h = 0xc3a5c85c97cb3127
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0xff51afd7ed558ccd)
      }
      return Math.abs(h)
    },
    description: "A successor to CityHash, it provides hash functions for strings and other types. Good for hash-based lookups and checksums."
  },
  'MD5': {
    func: (str: string) => {
      let h = 0
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i)
        h = h & h // Convert to 32-bit integer
      }
      return Math.abs(h)
    },
    description: "A widely used hash function, now considered cryptographically broken but still useful for non-security applications."
  },
  'SHA1': {
    func: (str: string) => {
      let h = 0x67452301
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x5a827999)
      }
      return Math.abs(h)
    },
    description: "A cryptographic hash function, now considered insecure for digital signatures but still used in some non-cryptographic applications."
  },
  'SHA256': {
    func: (str: string) => {
      let h = 0xc1059ed8
      for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 0x1b873593)
      }
      return Math.abs(h)
    },
    description: "A secure cryptographic hash function, part of SHA-2 family. Widely used for digital signatures and blockchain technologies."
  }
}

type HashFunction = keyof typeof hashFunctions

const howItWorks = [
  {
    title: "Initialization",
    description: "The Count-Min Sketch is initialized with a 2D array of counters, where rows represent hash functions and columns represent possible hash values.",
    details: "The number of rows is typically logarithmic in the desired error probability, while the number of columns is proportional to the inverse of the desired error in frequency estimates."
  },
  {
    title: "Adding an Element",
    description: "When adding an element, its hash is computed using each hash function, and the corresponding counters are incremented.",
    details: "This process ensures that for each element, one counter in each row is incremented. The use of multiple hash functions helps to distribute the counts and reduce collisions."
  },
  {
    title: "Querying Frequency",
    description: "To estimate an element's frequency, we compute its hash with each function and find the minimum value among the corresponding counters.",
    details: "Taking the minimum helps to reduce the impact of hash collisions, as the true count is always less than or equal to any of the counters that have been incremented for this element."
  },
  {
    title: "Error Bounds",
    description: "The Count-Min Sketch provides probabilistic guarantees on the accuracy of its frequency estimates.",
    details: "With probability 1-δ, the estimate is within an additive error of ε∥f∥₁, where ε and δ are parameters that trade off space usage versus accuracy, and ∥f∥₁ is the sum of all frequencies."
  }
]

const useCases = [
  {
    title: "Network Traffic Analysis",
    description: "Identifying heavy hitters or frequent items in network flows.",
    examples: ["Cisco's NetFlow", "Juniper's J-Flow"]
  },
  {
    title: "Database Query Optimization",
    description: "Estimating selectivity of queries for query plan optimization.",
    examples: ["PostgreSQL's statistics collector", "Oracle's adaptive query optimization"]
  },
  {
    title: "Stream Processing",
    description: "Tracking trending topics or popular items in real-time data streams.",
    examples: ["Apache Flink", "Twitter's Summingbird"]
  },
  {
    title: "Anomaly Detection",
    description: "Detecting unusual patterns or frequencies in large-scale systems.",
    examples: ["Datadog's anomaly detection", "Amazon CloudWatch"]
  },
  {
    title: "Caching Systems",
    description: "Identifying frequently accessed items for intelligent caching strategies.",
    examples: ["Memcached", "Redis"]
  }
]

export default function CountMinSketchSimulation() {
  const router = useRouter()
  const [width, setWidth] = useState(8)
  const [sketch, setSketch] = useState<number[][]>([])
  const [word, setWord] = useState('')
  const [queryWord, setQueryWord] = useState('')
  const [animatingCells, setAnimatingCells] = useState<[number, number][]>([])
  const [queriedCells, setQueriedCells] = useState<[number, number][]>([])
  const [minValueCell, setMinValueCell] = useState<[number, number] | null>(null)
  const [addedWords, setAddedWords] = useState<{ word: string; count: number }[]>([])
  const [queryResult, setQueryResult] = useState<number | null>(null)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isUseCasesOpen, setIsUseCasesOpen] = useState(false)
  const hashFunctionNames: HashFunction[] = Object.keys(hashFunctions) as HashFunction[]

  useEffect(() => {
    setSketch(Array(hashFunctionNames.length).fill(null).map(() => Array(width).fill(0)))
    setAddedWords([])
  }, [width])

  const hash = useCallback((word: string, hashFunction: HashFunction) => {
    return hashFunctions[hashFunction].func(word) % width
  }, [width])

  const addWord = useCallback(() => {
    if (!word) return
    const newSketch = sketch.map((row, i) => {
      const newRow = [...row]
      const col = hash(word, hashFunctionNames[i])
      newRow[col]++
      return newRow
    })
    setSketch(newSketch)
    setAnimatingCells(sketch.map((_, i) => [i, hash(word, hashFunctionNames[i])]))
    setTimeout(() => setAnimatingCells([]), 500)

    setAddedWords(prev => {
      const existingWord = prev.find(w => w.word === word)
      if (existingWord) {
        return prev.map(w => w.word === word ? { ...w, count: w.count + 1 } : w)
      } else {
        return [...prev, { word, count: 1 }]
      }
    })
    setWord('')
  }, [word, hash, sketch, hashFunctionNames])

  const querySketch = useCallback(() => {
    if (!queryWord) return
    const queriedIndices = sketch.map((_, i) => [i, hash(queryWord, hashFunctionNames[i])] as [number, number])
    setQueriedCells(queriedIndices)
    const counts = queriedIndices.map(([row, col]) => sketch[row][col])
    const estimatedCount = Math.min(...counts)
    setQueryResult(estimatedCount)
    const minIndex = counts.indexOf(estimatedCount)
    setMinValueCell(queriedIndices[minIndex])
    setTimeout(() => {
      setQueriedCells([])
      setMinValueCell(null)
    }, 2000)
  }, [queryWord, hash, sketch, hashFunctionNames])

  const handleWidthChange = useCallback((newWidth: number[]) => {
    setWidth(newWidth[0])
  }, [])

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }, [])

  // Update the setQueryWord function to reset queryResult
  const handleQueryWordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryWord(e.target.value)
    setQueryResult(null) // Reset the query result when the input changes
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 relative">
        <ArrowLeft 
          className="absolute top-4 left-4 cursor-pointer" 
          onClick={() => router.back()} 
          size={24} 
        />
      <motion.h1 
        className="text-3xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Count-Min Sketch Simulation
      </motion.h1>
      
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Label htmlFor="sketch-width" className="text-lg font-semibold">
          Sketch Width: {width} columns
        </Label>
        <Slider
          id="sketch-width"
          min={4}
          max={16}
          step={1}
          value={[width]}
          onValueChange={handleWidthChange}
          className="w-full"
        />
      </motion.div>
      
      <motion.div 
        className="overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <div className="inline-block">
          {sketch.map((row, rowIndex) => (
            <div key={rowIndex} className="flex mb-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-32 pr-2 flex items-center justify-end font-semibold text-sm cursor-help">
                      {hashFunctionNames[rowIndex]}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="right" 
                    align="start" 
                    className="z-50 max-w-xs"
                  >
                    <p className="text-sm">{hashFunctions[hashFunctionNames[rowIndex]].description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              {row.map((count, colIndex) => (
                <motion.div
                  key={colIndex}
                  className={`w-12 h-12 border border-gray-300 flex items-center justify-center text-sm ${
                    count > 0 ? 'bg-blue-100' : 'bg-gray-50'
                  }`}
                  animate={{
                    scale: animatingCells.some(([r, c]) => r === rowIndex && c === colIndex) ? [1, 1.2, 1] : 1,
                    backgroundColor: 
                      minValueCell && minValueCell[0] === rowIndex && minValueCell[1] === colIndex
                        ? '#FDE68A' // yellow for min value
                        : queriedCells.some(([r, c]) => r === rowIndex && c === colIndex)
                        ? '#BFDBFE' // light blue for queried cells
                        : count > 0 ? '#DBEAFE' : '#F9FAFB'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {count}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="flex space-x-2">
          <Input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, addWord)}
            placeholder="Enter a word to add"
            className="flex-grow"
          />
          <Button onClick={addWord} disabled={!word}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add to Sketch
          </Button>
        </div>

        <div className="flex space-x-2">
          <Input
            type="text"
            value={queryWord}
            onChange={handleQueryWordChange} // Use the new handler
            onKeyPress={(e) => handleKeyPress(e, querySketch)}
            placeholder="Enter a word to query"
            className="flex-grow"
          />
          <Button onClick={querySketch} disabled={!queryWord}>
            <Search className="w-4 h-4 mr-2" />
            Query Sketch
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {queryResult !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, 
             y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 p-4 rounded-md"
          >
            <h2 className="text-xl font-semibold mb-2">Query Result:</h2>
            <p className="flex items-center">
              <Hash className="text-blue-500 mr-2" />
              Estimated count for &quot;{queryWord}&quot;: {queryResult}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              (Actual count: {addedWords.find(w => w.word === queryWord)?.count || 0})
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addedWords.length > 0 && (
          <motion.div
            className="bg-green-100 p-4 rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-2">Words Added to Sketch</h2>
            <div className="grid grid-cols-3 gap-2">
              {addedWords.map(({ word, count }) => (
                <motion.div
                  key={word}
                  className="bg-green-200 p-2 rounded-md flex justify-between items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{word}</span>
                  <span className="font-semibold">{count}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
      <Collapsible
        open={isHowItWorksOpen}
        onOpenChange={setIsHowItWorksOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h2 className="text-xl font-semibold flex items-center"><BookOpenCheck className="mr-2" />How It Works</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isHowItWorksOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle How It Works</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          {howItWorks.map((step, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white p-3 rounded-md shadow-sm cursor-help">
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <p>{step.details}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </CollapsibleContent>
      </Collapsible>
</motion.div>
<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
      <Collapsible
        open={isUseCasesOpen}
        onOpenChange={setIsUseCasesOpen}
        className="w-full space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h2 className="text-xl font-semibold flex items-center"><Briefcase className="mr-2" />Use Cases & Technologies</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isUseCasesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle Use Cases & Technologies</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          {useCases.map((useCase, index) => (
            <div key={index} className="bg-white p-3 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">{useCase.title}</h3>
              <p className="mb-2">{useCase.description}</p>
              <p className="text-sm text-gray-600">
                <strong>Examples:</strong> {useCase.examples.join(", ")}
              </p>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
      </motion.div>
      <motion.div className="bg-yellow-100 p-4 rounded-md text-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      >
        <strong>Note:</strong> The hash functions used in this simulation are simplified versions for demonstration purposes. 
        They are not cryptographically secure and do not accurately represent the distribution properties of their real-world counterparts. 
        In practice, you would use proper implementations of these hash functions for accurate results.
      </motion.div>
      <div className="h-20"></div>
      <Footer />
    </div>
  )
}