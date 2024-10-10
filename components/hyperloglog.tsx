"use client"

import React, { useState, useCallback, useRef, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, ArrowLeft, Hash, Box, Zap, BarChart, Calculator, Gauge, Globe, Database, Network, BarChart2, BookOpenCheck,BriefcaseBusiness } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Footer from '@/components/Footer'

function hash64(str: string): [number, number] {
  let h1 = 0xdeadbeef ^ 0, h2 = 0x41c6ce57 ^ 0
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return [h1 >>> 0, h2 >>> 0]
}

function countLeadingZeros(n: number): number {
  return Math.clz32(n)
}

function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

const howItWorks = [
  {
    title: "64-bit Hashing",
    description: "Hash input using a 64-bit function",
    details: "Each input element is hashed using a 64-bit hash function. This ensures a uniform distribution of elements across buckets, reducing collisions and improving accuracy.",
    icon: Hash
  },
  {
    title: "Bucket Selection",
    description: "Use first 32 bits to select a bucket",
    details: "The first 32 bits of the hash are used to select a bucket in the HyperLogLog++ structure. This distributes elements evenly among the available buckets.",
    icon: Box
  },
  {
    title: "Leading Zeros Counting",
    description: "Count leading zeros in last 32 bits",
    details: "The number of leading zeros in the last 32 bits of the hash is counted. This value provides an estimate of the element's 'rarity' or uniqueness.",
    icon: Zap
  },
  {
    title: "Register Update",
    description: "Update bucket with max zero count",
    details: "The bucket's register is updated if the new leading zeros count is higher than the existing one. This keeps track of the 'rarest' element seen for each bucket.",
    icon: BarChart
  },
  {
    title: "Cardinality Estimation",
    description: "Use harmonic mean of buckets",
    details: "The harmonic mean of register values is used to estimate the number of unique elements. This combines the information from all buckets to produce a single estimate.",
    icon: Calculator
  },
  {
    title: "Bias Correction",
    description: "Apply corrections for extreme cases",
    details: "Adjustments are applied for small and large sets to improve accuracy. This corrects for biases that occur at extreme cardinalities, enhancing the overall precision of the estimate.",
    icon: Gauge
  }
]

const useCases = [
  {
    title: "Web Analytics",
    description: "Track unique visitors and page views",
    details: "HyperLogLog++ is used by web analytics platforms to estimate unique visitors and page views without storing individual user identifiers, saving storage and respecting privacy.",
    icon: Globe
  },
  {
    title: "Database Query Optimization",
    description: "Estimate result set sizes",
    details: "Database systems use HyperLogLog++ to quickly estimate the number of distinct elements in a query result, helping optimize query execution plans.",
    icon: Database
  },
  {
    title: "Network Traffic Analysis",
    description: "Count unique IP addresses",
    details: "Network monitoring tools employ HyperLogLog++ to estimate the number of unique IP addresses in high-volume traffic streams without storing each address.",
    icon: Network
  },
  {
    title: "Ad Tech",
    description: "Estimate unique ad impressions",
    details: "Advertising platforms use HyperLogLog++ to approximate the number of unique users who have seen an ad, helping measure campaign reach efficiently.",
    icon: BarChart2
  }
]

export default function HyperLogLogPlusPlusSimulation() {
  const router = useRouter()
  const [buckets, setBuckets] = useState<number[]>(new Array(64).fill(0))
  const [currentElement, setCurrentElement] = useState<string>('')
  const [uniqueElements, setUniqueElements] = useState<Set<string>>(new Set())
  const [bulkCount, setBulkCount] = useState<number>(100)
  const [animatingBucket, setAnimatingBucket] = useState<number | null>(null)
  const [recentAdditions, setRecentAdditions] = useState<string[]>([])
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false)
  const [isUseCasesOpen, setIsUseCasesOpen] = useState<boolean>(false)
  const [isAddingBulk, setIsAddingBulk] = useState<boolean>(false)
  const [highestCardinalityBucket, setHighestCardinalityBucket] = useState<number | null>(null)
  const [bulkAdditionProgress, setBulkAdditionProgress] = useState<number>(0)
  const recentAdditionsRef = useRef<string[]>([])
  const [showAllBuckets, setShowAllBuckets] = useState(false);

  const getColorForBucket = (value: number) => {
    const maxValue = 32 // Assuming a maximum of 32 leading zeros
    const normalizedValue = value / maxValue
    const hue = 200 // Blue hue
    const saturation = 70 + normalizedValue * 30 // 70% to 100%
    const lightness = 90 - normalizedValue * 40 // 90% to 50%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  const addElement = useCallback((element: string) => {
    const [h1, h2] = hash64(element)
    const bucketIndex = h1 % buckets.length
    const w = h2
    const leadingZeros = countLeadingZeros(w) + 1

    setAnimatingBucket(bucketIndex)
    
    if (!isAddingBulk) {
      recentAdditionsRef.current = [element, ...recentAdditionsRef.current.slice(0, 4)]
      setRecentAdditions(recentAdditionsRef.current)
    }

    setBuckets(prev => {
      const newBuckets = [...prev]
      if (leadingZeros > newBuckets[bucketIndex]) {
        newBuckets[bucketIndex] = leadingZeros
        const maxValue = Math.max(...newBuckets)
        setHighestCardinalityBucket(newBuckets.indexOf(maxValue))
      }
      return newBuckets
    })
    setUniqueElements(prev => new Set(prev).add(element))

    setTimeout(() => setAnimatingBucket(null), 100)
  }, [buckets.length, isAddingBulk])

  const addSingleElement = useCallback(() => {
    if (!currentElement) return
    addElement(currentElement)
    setCurrentElement('')
  }, [currentElement, addElement])

  const addBulkElements = useCallback((useDuplicates: boolean) => {
    setIsAddingBulk(true)
    setBulkAdditionProgress(0)
    let count = 0
    const addNext = () => {
      if (count < bulkCount) {
        const element = useDuplicates ? currentElement : generateRandomString(8)
        addElement(element)
        count++
        setBulkAdditionProgress(Math.floor((count / bulkCount) * 100))
        requestAnimationFrame(addNext)
      } else {
        setIsAddingBulk(false)
        setBulkAdditionProgress(0)
      }
    }
    requestAnimationFrame(addNext)
  }, [bulkCount, addElement, currentElement])

  const estimateCardinality = useCallback(() => {
    const m = buckets.length
    const alpha = 0.7213 / (1 + 1.079 / m)
    const harmonicMean = buckets.reduce((sum, value) => sum + Math.pow(2, -value), 0)
    let estimate = alpha * m * m / harmonicMean

    if (estimate <= 2.5 * m) {
      const V = buckets.filter(v => v === 0).length
      if (V > 0) {
        estimate = m * Math.log(m / V)
      }
    }
    else if (estimate > Math.pow(2, 32) / 30) {
      estimate = -Math.pow(2, 32) * Math.log(1 - estimate / Math.pow(2, 32))
    }

    return Math.round(estimate)
  }, [buckets])

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action()
    }
  }, [])

  const estimatedCardinality = estimateCardinality()
  const actualCardinality = uniqueElements.size
  const estimationError = actualCardinality > 0 ? ((estimatedCardinality - actualCardinality) / actualCardinality) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 relative">
     
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
        HyperLogLog++ Simulation
      </motion.h1>
      
        
        <motion.div
          className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-2">Input</h2>
          <div className="flex items-center mb-4">
            <Input
              type="text"
              value={currentElement}
              onChange={(e) => setCurrentElement(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, addSingleElement)}
              className="mr-2"
              placeholder="Enter element"
            />
            <Button onClick={addSingleElement} disabled={isAddingBulk}>Add</Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4">
          <Input
            type="number"
            value={bulkCount}
            onChange={(e) => setBulkCount(Math.max(1, parseInt(e.target.value) || 0))}
            className="w-full sm:w-24 mb-2 sm:mb-0 sm:mr-2"
            placeholder="Bulk count"
          />
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            <Button 
              onClick={() => addBulkElements(false)} 
              disabled={isAddingBulk}
              className="w-full sm:w-auto"
            >
              {isAddingBulk ? 'Adding...' : 'Add Bulk (Random)'}
            </Button>
            <Button 
              onClick={() => addBulkElements(true)} 
              disabled={isAddingBulk || !currentElement}
              className="w-full sm:w-auto"
            >
              {isAddingBulk ? 'Adding...' : 'Add Bulk (Duplicate)'}
            </Button>
          </div>
        </div>
        </motion.div>

        <motion.div
          className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Buckets ({showAllBuckets ? 'all' : 'first 16'})</h2>
            <Button onClick={() => setShowAllBuckets(!showAllBuckets)}>
              {showAllBuckets ? 'Show First 16' : 'Show All'}
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buckets.slice(0, showAllBuckets ? buckets.length : 16).map((value, index) => (
              <motion.div
                key={index}
                className={`p-2 rounded text-center ${
                  animatingBucket === index ? 'ring-2 ring-primary' : ''
                } ${highestCardinalityBucket === index ? 'ring-2 ring-yellow-400' : ''}`}
                style={{ backgroundColor: getColorForBucket(value) }}
                animate={{
                  scale: animatingBucket === index ? [1, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.1 }}
              >
                {value}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {(recentAdditions.length > 0 || isAddingBulk) && (
          <motion.div
            className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold mb-2">Recent Additions</h2>
            <div className="h-40 overflow-hidden">
              <AnimatePresence>
                {isAddingBulk ? (
                  <motion.div
                    key="bulk-addition"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5 }}
                    className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg text-center"
                  >
                    <h3 className="text-lg font-semibold mb-2">Adding Bulk Elements</h3>
                    <div className="w-full bg-primary-foreground/20 rounded-full h-2.5 mb-2">
                      <div 
                        className="bg-primary-foreground h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                        style={{ width: `${bulkAdditionProgress}%` }}
                      ></div>
                    </div>
                    <p>{bulkAdditionProgress}% Complete</p>
                  </motion.div>
                ) : (
                  recentAdditions.map((element, index) => (
                    <motion.div
                      key={element + index}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-secondary text-secondary-foreground p-2 rounded mb-2"
                    >
                      {element}
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        <motion.div
          className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl font-semibold mb-2">Statistics</h2>
          <motion.p
            key={estimatedCardinality}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.3 }}
          >
            Estimated Cardinality: {estimatedCardinality}
          </motion.p>
          <p>Actual Unique Elements: {actualCardinality}</p>
          <p>Estimation Error:  {estimationError.toFixed(2)}%</p>
        </motion.div>

         <motion.div
        className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Collapsible
          open={isHowItWorksOpen}
          onOpenChange={setIsHowItWorksOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
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
                    <div className="bg-gray-100 p-3 rounded-md shadow-sm cursor-help flex items-start">
                      <step.icon className="h-6 w-6 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">{step.title}</h3>
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
        className="w-full max-w-2xl p-6 mb-4 bg-white rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Collapsible
          open={isUseCasesOpen}
          onOpenChange={setIsUseCasesOpen}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
            <h2 className="text-xl font-semibold flex items-center"><BriefcaseBusiness className="mr-2" />Use Cases & Current Tech</h2>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-9 p-0">
                {isUseCasesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                <span className="sr-only">Toggle Use Cases & Current Tech</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            {useCases.map((useCase, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-gray-100 p-3 rounded-md shadow-sm cursor-help flex items-start">
                      <useCase.icon className="h-6 w-6 mr-2 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">{useCase.title}</h3>
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
      </div>
      <div className="h-20"></div>
      
      <Footer />
    </div>
  )
}