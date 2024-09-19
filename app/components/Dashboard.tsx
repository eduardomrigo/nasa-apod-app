'use client'

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Import icons from lucide-react
import { Home, Image, Rocket, Star } from 'lucide-react'
import APODDisplay from './APODDisplay'

const tabs = [
    { name: 'APOD', icon: Image },
    { name: 'Mars Rover', icon: Rocket },
    { name: 'Exoplanet', icon: Star },
]

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('APOD')

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                    <h1 className="text-2xl font-bold text-gray-800">NASA Dashboard</h1>
                </div>
                <nav className="mt-4">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.name}
                            variant={activeTab === tab.name ? 'default' : 'ghost'}
                            className={`w-full justify-start px-4 py-2 text-left ${activeTab === tab.name ? 'text-white' : 'text-gray-600'
                                }`}
                            onClick={() => setActiveTab(tab.name)}
                        >
                            <tab.icon className={`mr-2 size-4 ${activeTab === tab.name ? 'text-white' : 'text-gray-600'
                                }`} />
                            {tab.name}
                        </Button>
                    ))}
                </nav>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-8 overflow-auto">
                <Card>
                    <CardContent className="p-6">
                        {activeTab === 'APOD' && <APODDisplay />}
                        {activeTab === 'Mars Rover' && <div>Mars Rover Content (Coming Soon)</div>}
                        {activeTab === 'Exoplanet' && <div>Exoplanet Content (Coming Soon)</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}