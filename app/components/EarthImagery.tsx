'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Globe, Calendar, MapPin, Image as ImageIcon, Loader, Info } from 'lucide-react'
import Image from 'next/image'

interface EarthImageryProps {
  API_KEY: string
}

interface AssetInfo {
  date: string
  id: string
}

export default function EarthImagery({ API_KEY }: EarthImageryProps) {
  const [lat, setLat] = useState('1.5')
  const [lon, setLon] = useState('100.75')
  const [date, setDate] = useState('2024-01-29')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [assetInfo, setAssetInfo] = useState<AssetInfo | null>(null)

  const fetchEarthImagery = async () => {
    setLoading(true)
    setError('')
    setImageUrl('')
    setAssetInfo(null)

    const imageryUrl = `https://api.nasa.gov/planetary/earth/imagery?lon=${lon}&lat=${lat}&date=${date}&dim=0.15&api_key=${API_KEY}`
    const assetsUrl = `https://api.nasa.gov/planetary/earth/assets?lon=${lon}&lat=${lat}&date=${date}&dim=0.15&api_key=${API_KEY}`

    try {
      const [imageryResponse, assetsResponse] = await Promise.all([
        fetch(imageryUrl),
        fetch(assetsUrl)
      ])

      if (imageryResponse.ok) {
        const blob = await imageryResponse.blob()
        const objectUrl = URL.createObjectURL(blob)
        setImageUrl(objectUrl)
      } else {
        const errorData = await imageryResponse.json()
        setError(errorData.error.message || 'Failed to fetch image')
      }

      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json()
        setAssetInfo({
          date: formatDate(assetsData.date),
          id: assetsData.id
        })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('An error occurred while fetching the data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-6 w-6" />
          NASA Earth Imagery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-2/3">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Earth Imagery"
                width={800}
                height={800}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
            {assetInfo && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Asset Information
                </h3>
                <p>Date: {assetInfo.date}</p>
                <p>ID: {assetInfo.id}</p>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/3 space-y-6">
            <div>
              <Label htmlFor="latitude" className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Latitude
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Enter latitude"
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Longitude
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="Enter longitude"
              />
            </div>
            <div>
              <Label htmlFor="date" className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <Button onClick={fetchEarthImagery} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Fetching Data...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Get Earth Image
                </>
              )}
            </Button>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}