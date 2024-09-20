'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle, Calendar, Maximize2, Minimize2, Rocket, ThermometerSun, TrendingUp, Zap } from 'lucide-react'

interface NeoData {
  id: string
  name: string
  absolute_magnitude_h: number
  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number
      estimated_diameter_max?: number
    }
  }
  is_potentially_hazardous_asteroid: boolean
  close_approach_data?: Array<{
    close_approach_date: string
    miss_distance?: {
      kilometers?: string
    }
    relative_velocity?: {
      kilometers_per_hour?: string
    }
  }>
}

interface NeoFeedData {
  [date: string]: NeoData[]
}

interface NEODisplayProps {
  API_KEY: string
}

export default function NEODisplay({ API_KEY }: NEODisplayProps) {
  const [neoData, setNeoData] = useState<NeoFeedData | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAsteroid, setSelectedAsteroid] = useState<NeoData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-')
    return `${month}/${day}/${year}`
  }

  async function fetchNEO() {
    setLoading(true)
    setError(null)
    let url = `https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`

    if (startDate && endDate) {
      if (new Date(startDate) > new Date(endDate)) {
        setError('End date cannot be earlier than start date.')
        setLoading(false)
        return
      }
      url += `&start_date=${startDate}&end_date=${endDate}`
    } else {
      setError('Please select both start and end dates.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(url)
      const data = await res.json()
      setNeoData(data.near_earth_objects)
    } catch (error) {
      console.error('Error fetching NEO data:', error)
      setError('Failed to fetch NEO data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchAsteroidDetails(asteroidId: string) {
    setLoading(true)
    setError(null)
    const url = `https://api.nasa.gov/neo/rest/v1/neo/${asteroidId}?api_key=${API_KEY}`

    try {
      const res = await fetch(url)
      const data = await res.json()
      setSelectedAsteroid(data)
      setIsDialogOpen(true)
    } catch (error) {
      console.error('Error fetching asteroid details:', error)
      setError('Failed to fetch asteroid details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDiameter = (asteroid: NeoData) => {
    const min = asteroid.estimated_diameter?.kilometers?.estimated_diameter_min
    const max = asteroid.estimated_diameter?.kilometers?.estimated_diameter_max
    if (min !== undefined && max !== undefined) {
      return `${min.toFixed(2)} - ${max.toFixed(2)} km`
    }
    return 'Unknown'
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="w-full lg:w-3/4 space-y-4">
        {neoData && Object.entries(neoData).map(([date, asteroids]) => (
          <Card key={date} className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 size-4" />
                Asteroids on {formatDate(date)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {asteroids.map((asteroid) => (
                  <div key={asteroid.id} className="mb-4 p-4 border rounded-lg">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Rocket className="mr-2 size-4" />
                      {asteroid.name}
                    </h3>
                    <p className="flex items-center">
                      <Maximize2 className="mr-2 size-4" />
                      Estimated diameter: {formatDiameter(asteroid)}
                    </p>
                    <p className="flex items-center">
                      <AlertCircle className="mr-2 size-4" />
                      Potentially hazardous:
                      {asteroid.is_potentially_hazardous_asteroid ?
                        <span className="text-red-500 ml-1">Yes</span> :
                        <span className="text-green-500 ml-1">No</span>
                      }
                    </p>
                    <Button onClick={() => fetchAsteroidDetails(asteroid.id)} className="mt-2">
                      View Details
                    </Button>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
        {!neoData && !loading && <p>No data available. Please select a date range and fetch NEO data.</p>}
        {loading && <p>Loading...</p>}
      </div>
      <div className="w-full lg:w-1/4">
        <Card className='sticky top-4'>
          <CardHeader>
            <CardTitle>NEO Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchNEO} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Fetch NEO Data'}
            </Button>
            {error && <p className="text-red-500">{error}</p>}

          </CardContent>
        </Card>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center text-2xl">
              <Rocket className="mr-2 size-4" />
              {selectedAsteroid?.name}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {selectedAsteroid && (
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <ThermometerSun className="mr-2 size-4" />
                      <span>Absolute magnitude: {selectedAsteroid.absolute_magnitude_h}</span>
                    </div>
                    <div className="flex items-center">
                      <Maximize2 className="mr-2 size-4" />
                      <span>Estimated diameter: {formatDiameter(selectedAsteroid)}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 size-4" />
                      <span>
                        Potentially hazardous:
                        {selectedAsteroid.is_potentially_hazardous_asteroid ?
                          <span className="text-red-500 ml-1">Yes</span> :
                          <span className="text-green-500 ml-1">No</span>
                        }
                      </span>
                    </div>
                  </div>
                  <h4 className="font-semibold mt-6 mb-4 text-xl flex items-center">
                    <Zap className="mr-2 size-4" />
                    Close Approach Data:
                  </h4>
                  {selectedAsteroid.close_approach_data?.map((approach, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center">
                            <Calendar className="mr-2 size-4" />
                            <span>Date: {formatDate(approach.close_approach_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Minimize2 className="mr-2 size-4" />
                            <span>
                              Miss distance: {approach.miss_distance?.kilometers ?
                                `${parseFloat(approach.miss_distance.kilometers).toFixed(2)} km` :
                                'Unknown'
                              }
                            </span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="mr-2 size-4" />
                            <span>
                              Relative velocity: {approach.relative_velocity?.kilometers_per_hour ?
                                `${parseFloat(approach.relative_velocity.kilometers_per_hour).toFixed(2)} km/h` :
                                'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}