//import { Card, Text, Heading, Flex } from '@radix-ui/themes'
import { useState } from 'react';
//import { TrendingUp, TrendingDown, Database, Activity } from 'lucide-react'
import UserStatsBar from '@/components/shared/UserStatsBar';
import { RegistrationForm } from '@/pages/RegistrationForm'

export function Dashboard() {
  const [material, setMaterial] = useState('');
  const [volumen, setVolumen] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome the pitiax project dashboard</p>
      </div>


      <UserStatsBar
        cotizaciones={10}
        comprado={75000}
        tokens={5}
        variacion={1.6}
        cp=""
        nombreProyecto=""
        material={material}
        volumen={volumen}
        onMaterialChange={setMaterial}
        onVolumenChange={setVolumen}
      />

      <RegistrationForm onComplete={function (): void { }} />

    </div>
  )
}
