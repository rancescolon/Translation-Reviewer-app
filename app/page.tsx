"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  ChevronRight,
  ChevronLeft,
  Download,
  Save,
  ChevronUp,
  ChevronDown,
  Undo,
  Eye,
  ArrowLeft,
  Check,
  Upload,
  RefreshCw,
  AlertTriangle,
  Info,
  Keyboard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/header"
import { FileUploadCard } from "@/components/file-upload-card"
import { KeyboardShortcut } from "@/components/keyboard-shortcut"
import { StatusBadge } from "@/components/status-badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Local storage keys
const STORAGE_KEYS = {
  MODIFIED_DATA: "translation-reviewer-modified-data",
  CURRENT_PAIRS: "translation-reviewer-current-pairs",
  CURRENT_INDEX: "translation-reviewer-current-index",
  HISTORY: "translation-reviewer-history",
  TARGET_LANGUAGE: "translation-reviewer-target-language",
}

// Common language options
const LANGUAGE_OPTIONS = [
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "custom", label: "Custom..." },
]

export default function TranslationReviewer() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPairs, setCurrentPairs] = useState<
    Array<{
      path: string[]
      english: string
      targetText: string
      status: "pending" | "passed" | "failed"
      correction?: string
      section: string
    }>
  >([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<
    Array<{
      index: number
      status: "pending" | "passed" | "failed"
      correction?: string
    }>
  >([])
  const [showCorrection, setShowCorrection] = useState(false)
  const [correction, setCorrection] = useState("")
  const correctionInputRef = useRef<HTMLTextAreaElement>(null)
  const [progress, setProgress] = useState(0)
  const [modifiedData, setModifiedData] = useState<any>(null)
  const [sections, setSections] = useState<string[]>([])
  const [selectedSection, setSelectedSection] = useState<string>("all")

  // New state for showing changes preview
  const [showChangesPreview, setShowChangesPreview] = useState(false)

  // Add a filter to show only translations that need review in the preview page
  const [showOnlyNeedsReview, setShowOnlyNeedsReview] = useState(false)

  // New state for file uploads
  const [englishFile, setEnglishFile] = useState<File | null>(null)
  const [targetFile, setTargetFile] = useState<File | null>(null)
  const [filesUploaded, setFilesUploaded] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // New state for target language
  const [targetLanguage, setTargetLanguage] = useState<string>("es")
  const [customLanguage, setCustomLanguage] = useState<string>("")
  const [showCustomLanguageInput, setShowCustomLanguageInput] = useState(false)

  // New state for missing keys
  const [missingKeys, setMissingKeys] = useState<{
    inEnglish: string[]
    inTarget: string[]
  }>({ inEnglish: [], inTarget: [] })
  const [showMissingKeys, setShowMissingKeys] = useState(false)

  // Add these new state variables after the existing state declarations
  const [dragOver, setDragOver] = useState<string | null>(null)

  // Load data from local storage if available
  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return

    const storedModifiedData = localStorage.getItem(STORAGE_KEYS.MODIFIED_DATA)
    const storedCurrentPairs = localStorage.getItem(STORAGE_KEYS.CURRENT_PAIRS)
    const storedCurrentIndex = localStorage.getItem(STORAGE_KEYS.CURRENT_INDEX)
    const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY)
    const storedTargetLanguage = localStorage.getItem(STORAGE_KEYS.TARGET_LANGUAGE)

    if (storedTargetLanguage) {
      setTargetLanguage(storedTargetLanguage)
      if (!LANGUAGE_OPTIONS.some((option) => option.value === storedTargetLanguage)) {
        setCustomLanguage(storedTargetLanguage)
        setShowCustomLanguageInput(true)
      }
    }

    if (storedModifiedData && storedCurrentPairs) {
      try {
        const parsedModifiedData = JSON.parse(storedModifiedData)
        const parsedCurrentPairs = JSON.parse(storedCurrentPairs)
        const parsedCurrentIndex = storedCurrentIndex ? Number.parseInt(storedCurrentIndex) : 0
        const parsedHistory = storedHistory ? JSON.parse(storedHistory) : []

        setModifiedData(parsedModifiedData)
        setData(parsedModifiedData) // Also set as original data for reference
        setCurrentPairs(parsedCurrentPairs)
        setCurrentIndex(parsedCurrentIndex)
        setHistory(parsedHistory)
        setFilesUploaded(true)

        // Extract sections from the loaded pairs
        const uniqueSections = Array.from(new Set(parsedCurrentPairs.map((pair: any) => pair.section))).sort()
        setSections(uniqueSections)
      } catch (err) {
        console.error("Error loading from local storage:", err)
        // If there's an error parsing the stored data, we'll just start fresh
      }
    }
  }, [])

  // Save to local storage whenever relevant state changes
  useEffect(() => {
    // Only run on the client side
    if (typeof window === "undefined") return

    if (filesUploaded && modifiedData && currentPairs.length > 0) {
      localStorage.setItem(STORAGE_KEYS.MODIFIED_DATA, JSON.stringify(modifiedData))
      localStorage.setItem(STORAGE_KEYS.CURRENT_PAIRS, JSON.stringify(currentPairs))
      localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentIndex.toString())
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
      localStorage.setItem(STORAGE_KEYS.TARGET_LANGUAGE, targetLanguage)
    }
  }, [modifiedData, currentPairs, currentIndex, history, filesUploaded, targetLanguage])

  // Update the keyboard event handler to match the new controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if files aren't uploaded yet or if showing missing keys
      if (!filesUploaded || showMissingKeys) return

      // Add Escape key handler for the preview page
      if (showChangesPreview && e.key === "Escape") {
        setShowChangesPreview(false)
        return
      }

      // Don't handle keyboard shortcuts in changes preview mode
      if (showChangesPreview) return

      if (loading || currentPairs.length === 0) return

      // If correction mode is active, only handle Enter key and ignore arrow keys
      if (showCorrection) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault() // Prevent newline in textarea
          handleSubmitCorrection()
        }
        return // Ignore all other keys when in correction mode
      }

      // Only handle arrow keys when not in correction mode
      if (e.key === "ArrowRight") {
        handleNextSet()
      } else if (e.key === "ArrowLeft") {
        handlePrevSet()
      } else if (e.key === "ArrowUp") {
        handleFail() // Review set
      } else if (e.key === "ArrowDown") {
        handlePass() // Pass the current translation
      } else if (e.key === "z" && (e.ctrlKey || e.metaKey)) {
        // Add Ctrl+Z / Cmd+Z for undo
        e.preventDefault()
        handleUndo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    currentIndex,
    currentPairs,
    showCorrection,
    correction,
    loading,
    history,
    showChangesPreview,
    filesUploaded,
    showMissingKeys,
  ])

  useEffect(() => {
    if (showCorrection && correctionInputRef.current) {
      correctionInputRef.current.focus()
    }
  }, [showCorrection])

  useEffect(() => {
    if (currentPairs.length > 0) {
      const completedCount = currentPairs.filter((pair) => pair.status !== "pending").length
      setProgress((completedCount / currentPairs.length) * 100)
    }
  }, [currentPairs])

  // Handle language selection
  const handleLanguageChange = (value: string) => {
    setTargetLanguage(value)
    if (value === "custom") {
      setShowCustomLanguageInput(true)
    } else {
      setShowCustomLanguageInput(false)
    }
  }

  const handleCustomLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomLanguage(e.target.value)
    setTargetLanguage(e.target.value)
  }

  // Handle file uploads
  const handleEnglishFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEnglishFile(e.target.files[0])
    }
  }

  const handleTargetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTargetFile(e.target.files[0])
    }
  }

  // Add these new functions before the processFiles function
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, target: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(target)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(null)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, target: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(null)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type !== "application/json") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JSON file.",
          variant: "destructive",
        })
        return
      }

      if (target === "english") {
        setEnglishFile(file)
      } else if (target === "target") {
        setTargetFile(file)
      }
    }
  }

  // Function to find missing keys in both objects
  const findMissingKeys = (
    englishObj: any,
    targetObj: any,
    path: string[] = [],
  ): { inEnglish: string[]; inTarget: string[] } => {
    const missingInEnglish: string[] = []
    const missingInTarget: string[] = []

    // Check keys in English that are missing in Target
    for (const key in englishObj) {
      const newPath = [...path, key]
      const pathString = newPath.join(".")

      if (!(key in targetObj)) {
        missingInTarget.push(pathString)
      } else if (
        typeof englishObj[key] === "object" &&
        englishObj[key] !== null &&
        typeof targetObj[key] === "object" &&
        targetObj[key] !== null
      ) {
        // Recursively check nested objects
        const nestedMissing = findMissingKeys(englishObj[key], targetObj[key], newPath)
        missingInEnglish.push(...nestedMissing.inEnglish)
        missingInTarget.push(...nestedMissing.inTarget)
      }
    }

    // Check keys in Target that are missing in English
    for (const key in targetObj) {
      const newPath = [...path, key]
      const pathString = newPath.join(".")

      if (!(key in englishObj)) {
        missingInEnglish.push(pathString)
      }
      // We don't need to check nested objects here as we already did that above
    }

    return { inEnglish: missingInEnglish, inTarget: missingInTarget }
  }

  const processFiles = async () => {
    if (!englishFile || !targetFile) {
      toast({
        title: "Missing Files",
        description: "Please upload both English and Target language JSON files.",
        variant: "destructive",
      })
      return
    }

    if (targetLanguage === "custom" && !customLanguage.trim()) {
      toast({
        title: "Missing Language",
        description: "Please enter a custom language name.",
        variant: "destructive",
      })
      return
    }

    const effectiveTargetLanguage = targetLanguage === "custom" ? customLanguage : targetLanguage

    setIsProcessing(true)
    setLoading(true)
    setError(null)

    try {
      // Read the files
      const englishData = await readFileAsJSON(englishFile)
      const targetData = await readFileAsJSON(targetFile)

      // Find missing keys
      const missing = findMissingKeys(englishData, targetData)
      setMissingKeys({
        inEnglish: missing.inEnglish,
        inTarget: missing.inTarget,
      })

      // Create a combined data structure
      const combinedData = {
        en: englishData,
        [effectiveTargetLanguage]: targetData,
      }

      setData(combinedData)
      setModifiedData(JSON.parse(JSON.stringify(combinedData)))

      // Extract all text pairs
      const pairs: Array<{
        path: string[]
        english: string
        targetText: string
        status: "pending" | "passed" | "failed"
        correction?: string
        section: string
      }> = []

      // Extract sections for navigation
      const uniqueSections = new Set<string>()

      const extractPairs = (enObj: any, targetObj: any, path: string[] = []) => {
        for (const key in enObj) {
          if (!(key in targetObj)) {
            // Skip keys that don't exist in target language
            continue
          }

          const newPath = [...path, key]

          // Determine the section (top-level key)
          const section = path.length === 0 ? key : path[0]

          if (typeof enObj[key] === "string" && typeof targetObj[key] === "string") {
            pairs.push({
              path: [effectiveTargetLanguage, ...path, key],
              english: enObj[key],
              targetText: targetObj[key],
              status: "pending",
              section,
            })
            uniqueSections.add(section)
          } else if (
            typeof enObj[key] === "object" &&
            enObj[key] !== null &&
            typeof targetObj[key] === "object" &&
            targetObj[key] !== null
          ) {
            extractPairs(enObj[key], targetObj[key], newPath)
          }
        }
      }

      extractPairs(englishData, targetData)

      if (pairs.length === 0) {
        throw new Error("No matching text pairs found in the uploaded files")
      }

      setCurrentPairs(pairs)
      setSections(Array.from(uniqueSections).sort())
      setCurrentIndex(0)
      setHistory([])
      setFilesUploaded(true)

      // Save initial data to local storage
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.MODIFIED_DATA, JSON.stringify(combinedData))
        localStorage.setItem(STORAGE_KEYS.CURRENT_PAIRS, JSON.stringify(pairs))
        localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, "0")
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]))
        localStorage.setItem(STORAGE_KEYS.TARGET_LANGUAGE, effectiveTargetLanguage)
      }

      // Show missing keys if there are any
      if (missing.inEnglish.length > 0 || missing.inTarget.length > 0) {
        setShowMissingKeys(true)
        toast({
          title: "Missing Keys Detected",
          description: `Found ${missing.inEnglish.length + missing.inTarget.length} keys that don't match between files.`,
          variant: "warning",
        })
      } else {
        toast({
          title: "Files Processed Successfully",
          description: `Found ${pairs.length} text pairs across ${uniqueSections.size} sections.`,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred processing the files")
      toast({
        title: "Error Processing Files",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setIsProcessing(false)
    }
  }

  const readFileAsJSON = (file: File): Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string)
          resolve(json)
        } catch (err) {
          reject(new Error(`Invalid JSON in file ${file.name}`))
        }
      }
      reader.onerror = () => reject(new Error(`Error reading file ${file.name}`))
      reader.readAsText(file)
    })
  }

  const resetApp = () => {
    // Clear local storage
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.MODIFIED_DATA)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_PAIRS)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_INDEX)
      localStorage.removeItem(STORAGE_KEYS.HISTORY)
      localStorage.removeItem(STORAGE_KEYS.TARGET_LANGUAGE)
    }

    // Reset state
    setData(null)
    setModifiedData(null)
    setCurrentPairs([])
    setCurrentIndex(0)
    setHistory([])
    setEnglishFile(null)
    setTargetFile(null)
    setFilesUploaded(false)
    setError(null)
    setSections([])
    setSelectedSection("all")
    setShowChangesPreview(false)
    setShowMissingKeys(false)
    setMissingKeys({ inEnglish: [], inTarget: [] })

    toast({
      title: "App Reset",
      description: "All data has been cleared. You can now upload new files.",
    })
  }

  // Completely rewritten updateModifiedData function to ensure it works correctly
  const updateModifiedData = (path: string[], value: string) => {
    // Create a deep copy of the current modified data
    const newModifiedData = JSON.parse(JSON.stringify(modifiedData))

    // Start at the root of the modified data
    let current = newModifiedData

    // Navigate through the path
    for (let i = 0; i < path.length - 1; i++) {
      const segment = path[i]
      if (current[segment] === undefined) {
        console.error(`Path segment '${segment}' not found in modifiedData`)
        return newModifiedData
      }
      current = current[segment]
    }

    // Update the value at the last key
    const lastKey = path[path.length - 1]
    if (current[lastKey] !== undefined) {
      current[lastKey] = value
      console.log(`Successfully updated value at path: ${path.join(" > ")}`)
    } else {
      console.error(`Last key '${lastKey}' not found in modifiedData`)
    }

    return newModifiedData
  }

  // Add new navigation functions
  const handleNextSet = () => {
    if (currentIndex < currentPairs.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevSet = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Completely rewritten handlePass function
  const handlePass = () => {
    if (currentIndex >= currentPairs.length) return

    const newPairs = [...currentPairs]
    const currentPair = newPairs[currentIndex]

    // Store the current state for history
    const previousStatus = currentPair.status
    const previousCorrection = currentPair.correction

    // Check if this translation has a correction
    if (currentPair.correction) {
      // If it has a correction, we need to ensure it's preserved in modifiedData
      const updatedData = updateModifiedData(currentPair.path, currentPair.correction)
      setModifiedData(updatedData)

      console.log("Preserving correction when passing:", {
        path: currentPair.path,
        correction: currentPair.correction,
      })
    }

    // Update the pair status to passed, but preserve the correction
    newPairs[currentIndex] = {
      ...currentPair,
      status: "passed",
      // Keep the correction if it exists
      correction: previousCorrection,
    }

    // Add to history
    setHistory([
      ...history,
      {
        index: currentIndex,
        status: previousStatus,
        correction: previousCorrection,
      },
    ])

    setCurrentPairs(newPairs)

    // Automatically advance to the next translation if not at the end
    if (currentIndex < currentPairs.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // New function to pass a translation by its index (for use in preview page)
  const handlePassByIndex = (index: number) => {
    if (index >= currentPairs.length) return

    const newPairs = [...currentPairs]
    const targetPair = newPairs[index]

    // Store the current state for history
    const previousStatus = targetPair.status
    const previousCorrection = targetPair.correction

    // Check if this translation has a correction
    if (targetPair.correction) {
      // If it has a correction, we need to ensure it's preserved in modifiedData
      const updatedData = updateModifiedData(targetPair.path, targetPair.correction)
      setModifiedData(updatedData)

      console.log("Preserving correction when passing by index:", {
        path: targetPair.path,
        correction: targetPair.correction,
      })
    }

    // Update the pair status to passed, but preserve the correction
    newPairs[index] = {
      ...targetPair,
      status: "passed",
      // Keep the correction if it exists
      correction: previousCorrection,
    }

    // Add to history
    setHistory([
      ...history,
      {
        index: index,
        status: previousStatus,
        correction: previousCorrection,
      },
    ])

    setCurrentPairs(newPairs)

    // Show a toast notification
    toast({
      title: "Translation Passed",
      description: "The translation has been marked as approved.",
    })
  }

  // Update the handleSubmitCorrection function
  const handleSubmitCorrection = () => {
    if (currentIndex >= currentPairs.length) return

    const newPairs = [...currentPairs]
    const currentPair = newPairs[currentIndex]

    // Check if the correction is the same as the original target text
    const isUnchanged = correction === currentPair.targetText

    // Store the previous state for history
    const previousStatus = currentPair.status
    const previousCorrection = currentPair.correction

    // Update the pair
    newPairs[currentIndex] = {
      ...currentPair,
      status: isUnchanged ? "passed" : "failed",
      correction: isUnchanged ? undefined : correction,
    }

    // Only update the modified data if there's an actual correction
    if (!isUnchanged) {
      // Update the modified data with the correction
      const updatedData = updateModifiedData(currentPair.path, correction)
      setModifiedData(updatedData)

      console.log("Applying correction:", {
        path: currentPair.path,
        correction,
        targetText: currentPair.targetText,
      })
    }

    // Add to history
    setHistory([
      ...history,
      {
        index: currentIndex,
        status: previousStatus,
        correction: previousCorrection,
      },
    ])

    setCurrentPairs(newPairs)
    setShowCorrection(false)

    // Automatically advance to the next translation if not at the end
    if (currentIndex < currentPairs.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleFail = () => {
    if (currentIndex >= currentPairs.length) return

    setShowCorrection(true)
    setCorrection(currentPairs[currentIndex].correction || currentPairs[currentIndex].targetText)
  }

  // Add a new function to handle canceling the correction and marking as approved
  const handleCancelCorrection = () => {
    // Mark the current translation as passed
    const newPairs = [...currentPairs]
    const currentPair = newPairs[currentIndex]

    // Store the previous state for history
    const previousStatus = currentPair.status
    const previousCorrection = currentPair.correction

    newPairs[currentIndex] = {
      ...currentPair,
      status: "passed",
      // Keep any existing correction
      correction: previousCorrection,
    }

    // If there's an existing correction, make sure it's preserved in modifiedData
    if (previousCorrection) {
      const updatedData = updateModifiedData(currentPair.path, previousCorrection)
      setModifiedData(updatedData)
    }

    // Add to history
    setHistory([
      ...history,
      {
        index: currentIndex,
        status: previousStatus,
        correction: previousCorrection,
      },
    ])

    setCurrentPairs(newPairs)
    setShowCorrection(false)

    // Automatically advance to the next translation if not at the end
    if (currentIndex < currentPairs.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleUndo = () => {
    if (history.length === 0) return

    const lastAction = history[history.length - 1]
    const newPairs = [...currentPairs]
    const currentPair = newPairs[lastAction.index]

    // If we're undoing a failed status with a correction, we need to restore the original target text
    if (currentPair.status === "failed" && currentPair.correction) {
      // Update the modified data to restore the original target text
      const updatedData = updateModifiedData(currentPair.path, currentPair.targetText)
      setModifiedData(updatedData)
    }

    // If we're undoing to a failed status with a correction, we need to apply that correction
    if (lastAction.status === "failed" && lastAction.correction) {
      // Update the modified data with the previous correction
      const updatedData = updateModifiedData(currentPair.path, lastAction.correction)
      setModifiedData(updatedData)
    }

    // Update the pair to its previous state
    newPairs[lastAction.index] = {
      ...newPairs[lastAction.index],
      status: lastAction.status,
      correction: lastAction.correction,
    }

    setCurrentPairs(newPairs)
    setCurrentIndex(lastAction.index)
    setHistory(history.slice(0, -1))
    setShowCorrection(false)
  }

  const handleExport = () => {
    // Before exporting, ensure all corrections are applied to modifiedData
    let finalData = JSON.parse(JSON.stringify(modifiedData))

    // Go through all pairs with corrections and ensure they're applied
    for (const pair of currentPairs) {
      if (pair.correction) {
        finalData = updateModifiedData(pair.path, pair.correction)
      }
    }

    const dataStr = JSON.stringify(finalData, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

    const exportFileDefaultName = "translations.json"

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "JSON Exported",
      description: `Exported ${reviewedCount} of ${totalCount} reviewed translations.`,
    })
  }

  const handleSaveToLocalStorage = () => {
    // Before saving, ensure all corrections are applied to modifiedData
    let finalData = JSON.parse(JSON.stringify(modifiedData))

    // Go through all pairs with corrections and ensure they're applied
    for (const pair of currentPairs) {
      if (pair.correction) {
        finalData = updateModifiedData(pair.path, pair.correction)
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.MODIFIED_DATA, JSON.stringify(finalData))
      localStorage.setItem(STORAGE_KEYS.CURRENT_PAIRS, JSON.stringify(currentPairs))
      localStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, currentIndex.toString())
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history))
      localStorage.setItem(STORAGE_KEYS.TARGET_LANGUAGE, targetLanguage)
    }

    // Update the modifiedData state with the final data
    setModifiedData(finalData)

    toast({
      title: "Progress Saved",
      description: "Your progress has been saved to local storage.",
    })
  }

  const handleSectionChange = (value: string) => {
    setSelectedSection(value)

    if (value === "all") {
      // No need to jump to any specific index
      return
    }

    // Find the first item in the selected section
    const firstIndexInSection = currentPairs.findIndex((pair) => pair.section === value)

    if (firstIndexInSection !== -1) {
      setCurrentIndex(firstIndexInSection)
    }
  }

  // Find the next pending translation in the current section or overall
  const findNextPending = () => {
    if (selectedSection === "all") {
      // Look for any pending translation
      const nextPendingIndex = currentPairs.findIndex(
        (pair, index) => index > currentIndex && pair.status === "pending",
      )
      if (nextPendingIndex !== -1) {
        return nextPendingIndex
      }
    } else {
      // Look for pending translations in the current section
      const nextPendingIndex = currentPairs.findIndex(
        (pair, index) => index > currentIndex && pair.section === selectedSection && pair.status === "pending",
      )
      if (nextPendingIndex !== -1) {
        return nextPendingIndex
      }
    }
    return -1
  }

  // Jump to the next pending translation
  const handleJumpToNextPending = () => {
    const nextPendingIndex = findNextPending()
    if (nextPendingIndex !== -1) {
      setCurrentIndex(nextPendingIndex)
    } else {
      toast({
        title: "No more pending translations",
        description:
          selectedSection === "all"
            ? "All translations have been reviewed."
            : `All translations in the "${selectedSection}" section have been reviewed.`,
      })
    }
  }

  // Toggle changes preview mode
  const toggleChangesPreview = () => {
    setShowChangesPreview(!showChangesPreview)
  }

  // Function to find the index of a pair by its path
  const findPairIndexByPath = (path: string[]) => {
    return currentPairs.findIndex((pair) => {
      if (pair.path.length !== path.length) return false
      for (let i = 0; i < path.length; i++) {
        if (pair.path[i] !== path[i]) return false
      }
      return true
    })
  }

  // Function to jump to a specific translation in the main view
  const jumpToTranslation = (path: string[]) => {
    const index = findPairIndexByPath(path)
    if (index !== -1) {
      setCurrentIndex(index)
      setShowChangesPreview(false)

      // Add a toast notification to confirm the navigation
      toast({
        title: "Navigated to Translation",
        description: `Viewing translation at path: ${path.slice(1).join(" > ")}`,
        duration: 3000,
      })
    }
  }

  // Get the display name of the target language
  const getTargetLanguageDisplay = () => {
    if (targetLanguage === "custom") return customLanguage
    const languageOption = LANGUAGE_OPTIONS.find((option) => option.value === targetLanguage)
    return languageOption ? languageOption.label : targetLanguage
  }

  // Calculate total missing keys count
  const totalMissingKeysCount = missingKeys.inEnglish.length + missingKeys.inTarget.length

  // Render the missing keys view
  if (showMissingKeys && filesUploaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Missing Keys Report" showResetButton={true} onResetClick={resetApp} />

        <main className="flex-1 container mx-auto py-8 px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Missing Keys Report</h2>
            <Button variant="outline" onClick={() => setShowMissingKeys(false)} className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Continue to Review
            </Button>
          </div>

          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Non-matching keys detected</AlertTitle>
            <AlertDescription>
              Some keys exist in one file but not the other. The review will only include keys that exist in both files.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="missing-in-target">
            <TabsList className="mb-4">
              <TabsTrigger value="missing-in-target">
                Missing in {getTargetLanguageDisplay()}{" "}
                <Badge variant="outline" className="ml-2">
                  {missingKeys.inTarget.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="missing-in-english">
                Missing in English{" "}
                <Badge variant="outline" className="ml-2">
                  {missingKeys.inEnglish.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="missing-in-target">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Keys in English but missing in {getTargetLanguageDisplay()}
                </h2>
                {missingKeys.inTarget.length === 0 ? (
                  <p className="text-muted-foreground">No missing keys found.</p>
                ) : (
                  <div className="overflow-y-auto max-h-96">
                    <ul className="space-y-2">
                      {missingKeys.inTarget.map((key, index) => (
                        <li key={index} className="p-2 bg-muted rounded flex items-center">
                          <Info className="h-4 w-4 text-blue-500 mr-2" />
                          <code className="text-sm">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="missing-in-english">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">
                  Keys in {getTargetLanguageDisplay()} but missing in English
                </h2>
                {missingKeys.inEnglish.length === 0 ? (
                  <p className="text-muted-foreground">No missing keys found.</p>
                ) : (
                  <div className="overflow-y-auto max-h-96">
                    <ul className="space-y-2">
                      {missingKeys.inEnglish.map((key, index) => (
                        <li key={index} className="p-2 bg-muted rounded flex items-center">
                          <Info className="h-4 w-4 text-blue-500 mr-2" />
                          <code className="text-sm">{key}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={resetApp} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" /> Reset App
            </Button>
            <Button onClick={() => setShowMissingKeys(false)}>Continue to Review</Button>
          </div>
        </main>
      </div>
    )
  }

  // Render the file upload interface if files haven't been uploaded yet
  if (!filesUploaded) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Translation Reviewer" />

        <main className="flex-1 container mx-auto py-8 px-4 max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Upload Translation Files</h2>
            <p className="text-muted-foreground">
              Review and correct translations between languages with this standalone app
            </p>
          </div>

          <Card className="p-6 mb-6">
            <div className="grid gap-6">
              <FileUploadCard
                id="english-file"
                label="English JSON File"
                file={englishFile}
                dragOver={dragOver === "english"}
                isProcessing={isProcessing}
                onDragOver={(e) => handleDragOver(e, "english")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "english")}
                onChange={handleEnglishFileChange}
              />

              <div className="grid gap-4">
                <Label htmlFor="target-language">Target Language</Label>
                <Select value={targetLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="target-language">
                    <SelectValue placeholder="Select target language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {showCustomLanguageInput && (
                  <div className="mt-2">
                    <Label htmlFor="custom-language">Custom Language Name</Label>
                    <Input
                      id="custom-language"
                      placeholder="Enter language name"
                      value={customLanguage}
                      onChange={handleCustomLanguageChange}
                    />
                  </div>
                )}
              </div>

              <FileUploadCard
                id="target-file"
                label={`Target Language JSON File (${getTargetLanguageDisplay()})`}
                file={targetFile}
                dragOver={dragOver === "target"}
                isProcessing={isProcessing}
                onDragOver={(e) => handleDragOver(e, "target")}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "target")}
                onChange={handleTargetFileChange}
              />

              <Button onClick={processFiles} disabled={!englishFile || !targetFile || isProcessing} className="w-full">
                {isProcessing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Files
                  </>
                )}
              </Button>
            </div>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">The app will help you review translations and export a combined JSON file.</p>
            <p>Your progress will be saved to your browser's local storage.</p>

            {typeof window !== "undefined" && localStorage.getItem(STORAGE_KEYS.MODIFIED_DATA) && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">You have a saved session</p>
                <Button variant="outline" onClick={() => setFilesUploaded(true)}>
                  Continue Previous Session
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Translation Reviewer" />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Loading translations...</h2>
            <p className="text-muted-foreground">Please wait while we process your files</p>
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Translation Reviewer" />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-red-500 mb-6">{error}</p>
            <Button variant="outline" onClick={resetApp}>
              Reset App
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (currentPairs.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Translation Reviewer" />

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No translations found</h2>
            <p className="text-muted-foreground mb-6">No matching text pairs were found in the provided JSON files.</p>
            <Button variant="outline" onClick={resetApp}>
              Reset App
            </Button>
          </div>
        </main>
      </div>
    )
  }

  const currentPair = currentPairs[currentIndex]
  const isLastPair = currentIndex === currentPairs.length - 1
  const reviewedCount = currentPairs.filter((pair) => pair.status !== "pending").length
  const totalCount = currentPairs.length

  // Get all pairs with corrections
  const correctedPairs = currentPairs.filter((pair) => pair.correction)

  // Calculate section statistics
  const sectionStats = sections.reduce(
    (acc, section) => {
      const sectionPairs = currentPairs.filter((pair) => pair.section === section)
      const reviewedInSection = sectionPairs.filter((pair) => pair.status !== "pending").length
      const passedInSection = sectionPairs.filter((pair) => pair.status === "passed").length
      const totalInSection = sectionPairs.length

      let status = "not-started"
      if (reviewedInSection === totalInSection && passedInSection === totalInSection) {
        status = "complete"
      } else if (reviewedInSection > 0) {
        status = "in-progress"
      }

      acc[section] = {
        reviewed: reviewedInSection,
        passed: passedInSection,
        total: totalInSection,
        percent: Math.round((reviewedInSection / totalInSection) * 100),
        status,
      }

      return acc
    },
    {} as Record<string, { reviewed: number; passed: number; total: number; percent: number; status: string }>,
  )

  // Render the changes preview page
  if (showChangesPreview) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header title="Changes Preview" showResetButton={true} onResetClick={resetApp} />

        <main className="flex-1 container mx-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={toggleChangesPreview} className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Review
              </Button>
              <h2 className="text-xl font-semibold">Changes Preview</h2>
            </div>
            <Button variant="default" onClick={handleExport} className="flex items-center">
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm">
                Showing <span className="font-medium">{correctedPairs.length}</span> translations with corrections
              </p>
              <div className="flex items-center">
                <Checkbox
                  id="show-needs-review"
                  checked={showOnlyNeedsReview}
                  onCheckedChange={(checked) => setShowOnlyNeedsReview(checked === true)}
                  className="mr-2"
                />
                <Label htmlFor="show-needs-review" className="text-sm cursor-pointer">
                  Show only translations that need review
                </Label>
              </div>
            </div>
          </div>

          {correctedPairs.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-lg text-muted-foreground">No corrections have been made yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">
                Review translations and make corrections to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => {
                let sectionCorrectedPairs = correctedPairs.filter((pair) => pair.section === section)

                // Apply filter if checkbox is checked
                if (showOnlyNeedsReview) {
                  sectionCorrectedPairs = sectionCorrectedPairs.filter((pair) => pair.status !== "passed")
                }

                if (sectionCorrectedPairs.length === 0) return null

                return (
                  <div key={section} className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b">
                      <h3 className="text-lg font-semibold">{section}</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted/30">
                            <th className="text-left p-3 border-b">Path</th>
                            <th className="text-left p-3 border-b">English</th>
                            <th className="text-left p-3 border-b">Original {getTargetLanguageDisplay()}</th>
                            <th className="text-left p-3 border-b">Corrected {getTargetLanguageDisplay()}</th>
                            <th className="text-left p-3 border-b">Status</th>
                            <th className="text-left p-3 border-b">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sectionCorrectedPairs.map((pair, idx) => {
                            // Find the index of this pair in the currentPairs array
                            const pairIndex = findPairIndexByPath(pair.path)
                            const needsReview = pair.status !== "passed"

                            return (
                              <tr
                                key={idx}
                                className={`hover:bg-muted/50 ${needsReview ? "bg-amber-50 dark:bg-amber-950/30" : ""}`}
                                onClick={() => jumpToTranslation(pair.path)}
                                style={{ cursor: "pointer" }}
                              >
                                <td className="p-3 border-b text-xs text-muted-foreground align-top">
                                  <span className="hover:underline">{pair.path.join(" > ")}</span>
                                </td>
                                <td className="p-3 border-b align-top">{pair.english}</td>
                                <td className="p-3 border-b text-red-500 dark:text-red-400 line-through align-top">
                                  {pair.targetText}
                                </td>
                                <td className="p-3 border-b text-green-600 dark:text-green-400 align-top">
                                  {pair.correction}
                                </td>
                                <td className="p-3 border-b align-top">
                                  <StatusBadge status={pair.status} />
                                </td>
                                <td className="p-3 border-b align-top">
                                  <div className="flex space-x-2">
                                    {pair.status !== "passed" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.stopPropagation() // Prevent row click
                                          handlePassByIndex(pairIndex)
                                        }}
                                        className="flex items-center"
                                      >
                                        <Check className="mr-1 h-3 w-3" /> Pass
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={needsReview ? "default" : "ghost"}
                                      onClick={(e) => {
                                        e.stopPropagation() // Prevent double handling
                                        jumpToTranslation(pair.path)
                                      }}
                                      className="flex items-center"
                                    >
                                      <Eye className="mr-1 h-3 w-3" /> {needsReview ? "Review" : "View"}
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>Click on any row to navigate to that translation for detailed review</p>
            <p className="mt-2">
              Press <kbd className="px-2 py-1 bg-muted rounded border">Esc</kbd> to return to the main review interface
            </p>
          </div>
        </main>
      </div>
    )
  }

  // Render the main review page
  return (
    <div className="flex min-h-screen flex-col">
      <Header
        title="Translation Reviewer"
        showMissingKeysButton={totalMissingKeysCount > 0}
        showResetButton={true}
        onMissingKeysClick={() => setShowMissingKeys(true)}
        onResetClick={resetApp}
        missingKeysCount={totalMissingKeysCount}
      />

      <main className="flex-1 container mx-auto py-6 px-4">
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress: {Math.round(progress)}%</span>
            <span>
              {currentIndex + 1} of {currentPairs.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-1/3">
              <Select value={selectedSection} onValueChange={handleSectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Jump to section..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => {
                    const stats = sectionStats[section]
                    const isComplete = stats?.status === "complete"
                    const isInProgress = stats?.status === "in-progress"

                    return (
                      <SelectItem key={section} value={section}>
                        <div className="flex items-center justify-between w-full pr-2">
                          <div className="flex items-center gap-2">
                            {isComplete && <span className="text-green-500 dark:text-green-400 font-bold">✓</span>}
                            {isInProgress && <span className="text-amber-500 dark:text-amber-400 font-bold">⋯</span>}
                            <span className={isComplete ? "font-medium" : ""}>{section}</span>
                          </div>
                          <span
                            className={`text-xs ${
                              isComplete
                                ? "text-green-500 dark:text-green-400"
                                : isInProgress
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {stats?.passed}/{stats?.total}
                          </span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-muted-foreground">
              Current section: <span className="font-semibold">{currentPair.section}</span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground justify-center">
          <div className="flex items-center gap-1">
            <span className="text-green-500 dark:text-green-400 font-bold">✓</span>
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-amber-500 dark:text-amber-400 font-bold">⋯</span>
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-1">
            <span>No icon</span>
            <span>Not Started</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-4">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-2 text-muted-foreground">English</h2>
            <div className="min-h-[150px] text-lg border rounded-md p-4 bg-muted/20">{currentPair.english}</div>
            <div className="text-xs text-muted-foreground mt-4">Path: {currentPair.path.join(" > ")}</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-muted-foreground">{getTargetLanguageDisplay()}</h2>
              <StatusBadge status={currentPair.status} />
            </div>

            {showCorrection ? (
              <div>
                <Textarea
                  ref={correctionInputRef}
                  value={correction}
                  onChange={(e) => setCorrection(e.target.value)}
                  className="min-h-[150px] text-lg"
                  placeholder="Enter corrected translation"
                />
                <div className="flex justify-end mt-4 space-x-2">
                  <Button variant="outline" onClick={handleCancelCorrection}>
                    Approve
                  </Button>
                  <Button onClick={handleSubmitCorrection}>Submit</Button>
                </div>
              </div>
            ) : (
              <div
                className={`min-h-[150px] text-lg border rounded-md p-4 bg-muted/20 ${
                  currentPair.status === "failed" ? "line-through text-red-500 dark:text-red-400" : ""
                }`}
              >
                {currentPair.targetText}

                {currentPair.status === "failed" && currentPair.correction && (
                  <div className="mt-4 text-green-600 dark:text-green-400 no-underline border-t pt-4">
                    <div className="font-medium mb-1 text-sm">Correction:</div>
                    {currentPair.correction}
                  </div>
                )}

                {currentPair.status === "passed" && currentPair.correction && (
                  <div className="mt-4 text-green-600 dark:text-green-400 no-underline border-t pt-4">
                    <div className="font-medium mb-1 text-sm">Correction:</div>
                    {currentPair.correction}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="flex justify-center flex-wrap gap-4 mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevSet}
            disabled={currentIndex === 0 || showCorrection}
            className="flex items-center"
          >
            <ChevronLeft className="mr-2" /> Previous
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleFail}
            disabled={showCorrection}
            className="flex items-center"
          >
            <ChevronUp className="mr-2" /> Review
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handlePass}
            disabled={showCorrection}
            className="flex items-center"
          >
            <ChevronDown className="mr-2" /> Pass
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNextSet}
            disabled={currentIndex === currentPairs.length - 1 || showCorrection}
            className="flex items-center"
          >
            Next <ChevronRight className="ml-2" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleUndo}
            disabled={history.length === 0 || showCorrection}
            className="flex items-center"
          >
            <Undo className="mr-2 h-4 w-4" /> Undo
          </Button>
        </div>

        <div className="flex justify-center flex-wrap gap-4">
          <Button variant="secondary" onClick={toggleChangesPreview} className="flex items-center">
            <Eye className="mr-2 h-4 w-4" /> Preview Changes ({correctedPairs.length})
          </Button>

          <Button variant="default" onClick={handleExport} className="flex items-center">
            <Download className="mr-2 h-4 w-4" /> Export JSON ({reviewedCount}/{totalCount})
          </Button>

          <Button variant="secondary" onClick={handleSaveToLocalStorage} className="flex items-center">
            <Save className="mr-2 h-4 w-4" /> Save Progress
          </Button>

          <Button variant="secondary" onClick={handleJumpToNextPending} className="flex items-center">
            <ChevronRight className="mr-2 h-4 w-4" /> Jump to Next Pending
          </Button>
        </div>

        <div className="mt-8 flex justify-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                See Controls
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <h3 className="text-sm font-medium mb-2">Keyboard Shortcuts</h3>
              <div className="grid grid-cols-1 gap-2">
                <KeyboardShortcut keys={["→"]} description="Next translation" />
                <KeyboardShortcut keys={["←"]} description="Previous translation" />
                <KeyboardShortcut keys={["↑"]} description="Review translation" />
                <KeyboardShortcut keys={["↓"]} description="Pass translation" />
                <KeyboardShortcut keys={["Ctrl", "Z"]} description="Undo last action" />
                <KeyboardShortcut keys={["Esc"]} description="Exit preview mode" />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
