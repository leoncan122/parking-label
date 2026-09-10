import { useState } from 'react'
import { X, Check, MapPin, ShieldCheck } from 'lucide-react'
import { VEHICLE_LABELS } from '../lib/supabase'
import LocationPicker from './LocationPicker'
import VehicleLabelSelector from './VehicleLabelSelector'

type Step = 'location' | 'vehicle' | 'confirm'

interface AddLocationWizardProps {
  onClose: () => void
  onSave: (lat: number, lng: number, label: string) => Promise<void>
}

export default function AddLocationWizard({ onClose, onSave }: AddLocationWizardProps) {
  const [step, setStep] = useState<Step>('location')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canProceed: Record<Step, boolean> = {
    location: !!location,
    vehicle: !!label,
    confirm: !!location && !!label,
  }

  const steps: { key: Step; icon: React.ElementType; title: string }[] = [
    { key: 'location', icon: MapPin, title: 'Ubicación' },
    { key: 'vehicle', icon: ShieldCheck, title: 'Vehículo' },
    { key: 'confirm', icon: ShieldCheck, title: 'Confirmar' },
  ]

  const currentIdx = steps.findIndex((s) => s.key === step)
  const isLastStep = currentIdx === steps.length - 1

  const handleFinish = async () => {
    if (!location || !label) return
    setSaving(true)
    try {
      await onSave(location.lat, location.lng, label)
    } finally {
      setSaving(false)
    }
  }

  const handleLocationSelected = (lat: number, lng: number) => {
    setLocation({ lat, lng })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full sm:rounded-2xl rounded-t-2xl max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">
            Agregar vehículo
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-2">
            {steps.map((s, i) => {
              const Icon = s.icon
              const isActive = s.key === step
              const isCompleted = i < currentIdx
              return (
                <div key={s.key} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 rounded-full mx-1 ${
                        isCompleted ? 'bg-green-300' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Paso {currentIdx + 1} de {steps.length}: {steps[currentIdx].title}
          </p>
        </div>

        {/* Step content */}
        <div className="px-4 py-2 space-y-4">
          {step === 'location' && (
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Selecciona la ubicación donde estacionaste tu vehículo.
              </p>
              <LocationPicker onLocationSelected={handleLocationSelected} />
            </div>
          )}

          {step === 'vehicle' && (
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Selecciona el tipo de vehículo.
              </p>
              <VehicleLabelSelector onSelect={setLabel} />
            </div>
          )}

          {step === 'confirm' && location && label && (
            <div className="space-y-4">
              {/* Location summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-1">📍 Ubicación</p>
                <p className="text-sm text-slate-800">
                  Lat: {location.lat.toFixed(6)} | Lng: {location.lng.toFixed(6)}
                </p>
              </div>

              {/* Vehicle summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600 font-medium mb-1">🏷️ Vehículo</p>
                <p className="text-sm text-slate-800">
                  {VEHICLE_LABELS.find((l) => l.value === label)?.label || label}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (currentIdx > 0) setStep(steps[currentIdx - 1].key)
            }}
            disabled={currentIdx === 0}
            className="px-4 py-3 text-slate-600 font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {currentIdx === 0 ? 'Cancelar' : '← Atrás'}
          </button>

          {!isLastStep ? (
            <button
              onClick={() => setStep(steps[currentIdx + 1].key)}
              disabled={!canProceed[step]}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed.confirm || saving}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>Guardando...</>
              ) : (
                <>
                  <Check className="w-5 h-5" /> Guardar ubicación
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
