"use client"

import { useState, useCallback, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { AlertCircle, CheckCircle2, Hash, ChevronUp, ChevronDown, ArrowLeft, Cpu, Fingerprint, ToggleLeft, Search, AlertTriangle, Globe, Database, Cloud, Bitcoin, Sparkles, BookOpenCheck, Briefcase } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
// Real-world hashing functions
const hashFunctions = {
  'murmur3': (str: string) => {
    let h1 = 0xdeadbeef
    let h2 = 0x41c6ce57
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i)
      h1 = Math.imul(h1 ^ ch, 0x85ebca77)
      h2 = Math.imul(h2 ^ ch, 0xc2b2ae3d)
    }
    h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x735a2d97)
    return Math.abs(h1)
  },
  'fnv1a': (str: string) => {
    let hash = 0x811c9dc5
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i)
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    }
    return Math.abs(hash >>> 0)
  },
  'djb2': (str: string) => {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i)
    }
    return Math.abs(hash)
  }
}

type HashFunction = keyof typeof hashFunctions
const howItWorks = [
  {
    title: "Initialize",
    description: "Create an array of bits, all set to 0.",
    details: "The Bloom filter starts with a bit array of a fixed size, where all bits are initially set to 0.",
    icon: <Cpu className="h-6 w-6" />
  },
  {
    title: "Hash",
    description: "Use multiple hash functions to map items to bit positions.",
    details: "When adding an item, multiple hash functions are used to generate several bit positions in the array.",
    icon: <Fingerprint className="h-6 w-6" />
  },
  {
    title: "Set Bits",
    description: "Set the bits at the calculated positions to 1.",
    details: "For each position calculated by the hash functions, the corresponding bit in the array is set to 1.",
    icon: <ToggleLeft className="h-6 w-6" />
  },
  {
    title: "Check Membership",
    description: "To check if an item is in the set, hash it and check all bit positions.",
    details: "To query the filter, hash the item and check if all corresponding bits are set to 1. If any bit is 0, the item is definitely not in the set.",
    icon: <Search className="h-6 w-6" />
  },
  {
    title: "False Positives",
    description: "The filter may report false positives, but never false negatives.",
    details: "A Bloom filter may incorrectly report that an item is in the set (false positive), but it will never incorrectly report that an item is not in the set when it actually is (false negative).",
    icon: <AlertTriangle className="h-6 w-6" />
  }
]

const useCases = [
  {
    title: "Web Browsers",
    description: "Used to check if a URL is potentially malicious.",
    details: "Google Chrome uses a Bloom filter to check URLs against a database of known malicious sites.",
    icon: <Globe className="h-6 w-6" />
  },
  {
    title: "Databases",
    description: "Optimize disk lookups in database systems.",
    details: "Cassandra and PostgreSQL use Bloom filters to reduce disk lookups for non-existent rows or keys.",
    icon: <Database className="h-6 w-6" />
  },
  {
    title: "Content Delivery Networks (CDNs)",
    description: "Efficiently check if content is cached.",
    details: "Akamai uses Bloom filters to quickly determine if a piece of content is likely to be in the cache.",
    icon: <Cloud className="h-6 w-6" />
  },
  {
    title: "Cryptocurrency",
    description: "Improve the efficiency of peer-to-peer networks.",
    details: "Bitcoin uses Bloom filters to speed up wallet synchronization in lightweight clients.",
    icon: <Bitcoin className="h-6 w-6" />
  },
  {
    title: "Spell Checkers",
    description: "Quickly check if a word might be misspelled.",
    details: "Some spell-checking algorithms use Bloom filters for rapid, memory-efficient string matching.",
    icon: <Sparkles className="h-6 w-6" />
  }
]
export default function BloomFilterSimulation() {
  const router = useRouter()
  const [filterSize, setFilterSize] = useState(32)
  const [bitArray, setBitArray] = useState<boolean[]>(new Array(filterSize).fill(false))
  const [word, setWord] = useState('')
  const [checkWord, setCheckWord] = useState('')
  const [animatingBits, setAnimatingBits] = useState<number[]>([])
  const [addedWords, setAddedWords] = useState<string[]>([])
  const [probability, setProbability] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [checkResult, setCheckResult] = useState<{ inFilter: boolean; inActualSet: boolean } | null>(null)
  const [selectedHashes, setSelectedHashes] = useState<HashFunction[]>(['murmur3', 'fnv1a'])
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const [isUseCasesOpen, setIsUseCasesOpen] = useState(false)

  const hash = useCallback((word: string, size: number) => {
    return selectedHashes.map(fn => hashFunctions[fn](word) % size)
  }, [selectedHashes])

  const addWord = useCallback(() => {
    if (addedWords.includes(word)) {
      alert("This word is already in the filter.")
      return
    }
    const indices = hash(word, filterSize)
    setAnimatingBits(indices)
    setTimeout(() => setAnimatingBits([]), 500)
    setBitArray(prev => {
      const newArray = [...prev]
      indices.forEach(index => {
        newArray[index] = true
      })
      return newArray
    })
    setAddedWords(prev => [...prev, word])
    setWord('')
  }, [word, hash, filterSize, addedWords])

  const checkBloomFilter = useCallback(() => {
    setIsChecking(true)
    const indices = hash(checkWord, filterSize)
    setAnimatingBits(indices)
    
    setTimeout(() => {
      setAnimatingBits([])
      const inFilter = indices.every(index => bitArray[index])
      const inActualSet = addedWords.includes(checkWord)
      setCheckResult({ inFilter, inActualSet })
      setIsChecking(false)
    }, 1000)
    
  }, [checkWord, hash, filterSize, bitArray, addedWords])

  useEffect(() => {
    const setbits = bitArray.filter(Boolean).length
    const probability = 1 - Math.pow(1 - setbits / filterSize, selectedHashes.length)
    setProbability(probability)
  }, [bitArray, filterSize, selectedHashes])

  const handleSizeChange = useCallback((newSize: number[]) => {
    const size = newSize[0]
    setFilterSize(size)
    setBitArray(new Array(size).fill(false))
    setAddedWords([])
    setCheckResult(null)
  }, [])

  const handleHashChange = useCallback((value: string) => {
    setSelectedHashes(value.split(',') as HashFunction[])
    setBitArray(new Array(filterSize).fill(false))
    setAddedWords([])
    setCheckResult(null)
  }, [filterSize])

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
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
        Bloom Filter Simulation
      </motion.h1>
      
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Label className="text-lg font-semibold">Hash Functions:</Label>
        <Tabs defaultValue={selectedHashes.join(',')} onValueChange={handleHashChange}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="murmur3,fnv1a">Murmur3 + FNV-1a</TabsTrigger>
            <TabsTrigger value="murmur3,djb2">Murmur3 + DJB2</TabsTrigger>
            <TabsTrigger value="fnv1a,djb2">FNV-1a + DJB2</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      <motion.div
        className="space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Label htmlFor="filter-size" className="text-lg font-semibold">
          Filter Size: {filterSize} elements
        </Label>
        <Slider
          id="filter-size"
          min={8}
          max={128}
          step={8}
          value={[filterSize]}
          onValueChange={handleSizeChange}
          className="w-full"
        />
      </motion.div>
      
      <motion.div 
        className="grid grid-cols-8 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {bitArray.map((bit, index) => (
          <motion.div
            key={index}
            className={`h-10 rounded-md flex items-center justify-center text-xs ${bit ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
            animate={{
              scale: animatingBits.includes(index) ? [1, 1.2, 1] : 1,
              backgroundColor: bit ? '#10B981' : '#E5E7EB'
            }}
            transition={{ duration: 0.3 }}
          >
            {index}
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
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
            <motion.span
              animate={{ scale: !word ? 1 : [1, 1.1, 1] }}
              transition={{ duration: 0.2 }}
            >
              Add to Filter
            </motion.span>
          </Button>
        </div>

        <div className="flex space-x-2">
          <Input
            type="text"
            value={checkWord}
            onChange={(e) => setCheckWord(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, checkBloomFilter)}
            placeholder="Enter a word to check"
            className="flex-grow"
          />
          <Button onClick={checkBloomFilter} disabled={!checkWord || isChecking}>
            <motion.span
              animate={{ scale: !checkWord || isChecking ? 1 : [1, 1.1, 1] }}
              transition={{ duration: 0.2 }}
            >
              {isChecking ? 'Checking...' : 'Check Filter'}
            </motion.span>
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {checkResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-100 p-4 rounded-md"
          >
            <h2 className="text-xl font-semibold mb-2">Check Result:</h2>
            <p className="flex items-center">
              {checkResult.inFilter ? (
                <CheckCircle2 className="text-green-500 mr-2" />
              ) : (
                <AlertCircle className="text-red-500 mr-2" />
              )}
              {checkResult.inFilter
                ? `"${checkWord}" is probably in the set`
                : `"${checkWord}" is definitely not in the set`}
            </p>
            {checkResult.inFilter && (
              <p className="mt-2 flex items-center">
                {checkResult.inActualSet ? (
                  <CheckCircle2 className="text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="text-yellow-500 mr-2" />
                )}
                {checkResult.inActualSet
                  ? "Confirmed: The word is actually in the set"
                  : "False Positive: The word is not actually in the set"}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="bg-blue-100 p-4 rounded-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Hash className="mr-2" />
          Filter Accuracy
        </h2>
        <div className="mt-2">
          <Label className="font-semibold">False Positive Probability:</Label>
          <motion.div
            className="bg-blue-200 h-6 rounded-full overflow-hidden mt-1"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-blue-500  h-full"
              initial={{ width: 0 }}
              animate={{ width: `${probability * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
          <p className="text-right mt-1">{(probability * 100).toFixed(2)}%</p>
        </div>
      </motion.div>
<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
     <Collapsible open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} className="w-full space-y-2">
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
                  <div className="bg-white p-3 rounded-md shadow-sm cursor-help flex items-start">
                    <div className="mr-3 mt-1">{step.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-2">{step.title}</h3>
                      <p>{step.description}</p>
                    </div>
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
      <Collapsible open={isUseCasesOpen} onOpenChange={setIsUseCasesOpen} className="w-full space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h2 className="text-xl font-semibold flex items-center"><Briefcase className="mr-2" />Use Cases & Current Tech</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isUseCasesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="sr-only">Toggle Use Cases</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          {useCases.map((useCase, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="bg-white p-3 rounded-md shadow-sm cursor-help flex items-start">
                    <div className="mr-3 mt-1">{useCase.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-2">{useCase.title}</h3>
                      <p>{useCase.description}</p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-sm">
                  <p>{useCase.details}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </CollapsibleContent>
      </Collapsible>
      </motion.div>
      <AnimatePresence>
        {addedWords.length > 0 && (
          <motion.div
            className="bg-green-100 p-4 rounded-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-semibold mb-2">Words Added to Filter</h2>
            <div className="grid grid-cols-3 gap-2">
              {addedWords.map((word) => (
                <motion.div
                  key={word}
                  className="bg-green-200 p-2 rounded-md"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {word}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        
      </AnimatePresence>
      <motion.div className="bg-yellow-100 p-4 rounded-md text-sm mt-10"
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