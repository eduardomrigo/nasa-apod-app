'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface APODData {
  copyright?: string
  date: string
  explanation: string
  hdurl: string
  media_type: string
  service_version: string
  title: string
  url: string
}

interface APODDisplayProps {
  API_KEY: string
}

export default function APODDisplay({ API_KEY }: APODDisplayProps) {
  const [apodData, setApodData] = useState<APODData | APODData[] | null>(null)
  const [showFullExplanation, setShowFullExplanation] = useState(false)
  const [date, setDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchAPOD() {
    if (!API_KEY) {
      setError("API key is missing. Please set your NASA API key.")
      return
    }

    setLoading(true)
    setError(null)
    let url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`

    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setError('End date cannot be earlier than start date.')
        setLoading(false)
        return
      }
      url += `&start_date=${startDate}&end_date=${endDate}`
    } else if (date) {
      url += `&date=${date}`
    }

    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      if (data.error) {
        throw new Error(data.error.message || 'An error occurred while fetching data')
      }
      setApodData(data)
    } catch (error) {
      console.error('Error fetching APOD:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
      setApodData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (API_KEY) {
      fetchAPOD()
    }
  }, [API_KEY])

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!apodData) {
    return <div className="text-center">No data available</div>
  }

  const renderAPODCard = (data: APODData, isGrid: boolean) => {
    const explanation = data.explanation ? data.explanation : 'No explanation available.'
    const truncatedExplanation = explanation.length > 150
      ? explanation.slice(0, 150) + '...'
      : explanation;

    return (
      <Card key={data.date} className="w-full mb-4">
        <CardHeader>
          <CardTitle className="text-xl font-bold">{data.title}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Date: {data.date}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.media_type === 'image' ? (
            <Image
              src={data.url}
              alt={data.title}
              width={800}
              height={600}
              className={`w-full rounded-lg ${isGrid ? 'h-64 object-cover' : 'h-auto'}`}
            />
          ) : (
            <iframe
              src={data.url}
              title={data.title}
              width="100%"
              height="450"
              className="rounded-lg"
            ></iframe>
          )}
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              {showFullExplanation ? explanation : truncatedExplanation}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFullExplanation(!showFullExplanation)}
            >
              {showFullExplanation ? 'Show Less' : 'Read More'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {data.copyright ? `© ${data.copyright}` : 'Public Domain'}
          </p>
          {data.hdurl && (
            <a
              href={data.hdurl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View Full Resolution
            </a>
          )}
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-3/4 space-y-4">
        {Array.isArray(apodData) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apodData.map(data => renderAPODCard(data, true))}
          </div>
        ) : (
          renderAPODCard(apodData, false)
        )}
      </div>
      <div className="w-full lg:w-1/4">
        <Card className='sticky top-4'>
          <CardHeader>
            <CardTitle>APOD Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Specific Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  setStartDate('')
                  setEndDate('')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setDate('')
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setDate('')
                }}
              />
            </div>
            <Button onClick={fetchAPOD} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Fetch APOD'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}