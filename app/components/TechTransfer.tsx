'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, FileText, Code, Rocket, Building } from 'lucide-react'

interface TechResult {
  id: string
  code: string
  title: string
  description: string
  center: string
  category: string
  imageUrl: string
}

interface TechTransferProps {
  API_KEY: string
}

export default function TechTransfer({ API_KEY }: TechTransferProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchType, setSearchType] = useState('patent')
  const [results, setResults] = useState<TechResult[]>([])
  const [loading, setLoading] = useState(false)


  const searchTech = async () => {
    if (!searchTerm) return

    setLoading(true)
    try {
      const response = await fetch(`https://api.nasa.gov/techtransfer/${searchType}/?${searchTerm}&api_key=${API_KEY}`)
      const data = await response.json()

      const formattedResults: TechResult[] = data.results.map((result: any[]) => ({
        id: result[0],
        code: result[1],
        title: result[2].replace(/<\/?span[^>]*>/g, ""),
        description: result[3],
        category: result[5],
        center: result[9],
        imageUrl: result[10]
      }))

      setResults(formattedResults)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'propulsion':
        return <Rocket className="w-6 h-6" />
      case 'software':
        return <Code className="w-6 h-6" />
      default:
        return <FileText className="w-6 h-6" />
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NASA Tech Transfer Search</h1>
      <div className="flex space-x-2 mb-4">
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="patent">Patents</SelectItem>
            <SelectItem value="patent_issued">Issued Patents</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="spinoff">Spinoffs</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Enter search term"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={searchTech} disabled={loading}>
          {loading ? 'Searching...' : <Search className="w-4 h-4 mr-2" />}
          Search
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col h-full">
                  <div className="h-48">
                    <img
                      src={result.imageUrl || '/placeholder.svg?height=200&width=300'}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex-grow">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      {getCategoryIcon(result.category)}
                      <span className="ml-2">{result.title}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mb-2">{result.code}</p>
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <Building className="w-4 h-4 mr-2" />
                      Center: {result.center}
                    </p>
                    <p className="text-sm line-clamp-3" dangerouslySetInnerHTML={{ __html: result.description }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}