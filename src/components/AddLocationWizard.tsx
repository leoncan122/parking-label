import { useState } from 'react'
import { X, Check } from 'lucide-react'
import LocationPicker from './LocationPicker'
import VehicleLabelSelector from './VehicleLabelSelector'

type Step = 'location' | 'vehicle'

interface AddLocationWizardProps {
  onClose: () => void
  onSave: (lat: number, lng: number, label: string) => Promise<void>
}

export default function AddLocationWizard({ onClose, onSave }: AddLocationWizardProps) {
  const [step, setStep] = useState<Step>('location')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const canProceed = step === 'location' ? !!location : !!label

  const handleFinish = async () => {
    if (!location || !label) return
    setSaving(true)
    try {
      await onSave(location.lat, location.lng, label)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full sm:rounded-2xl rounded-t-2xl max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {step === 'location' ? 'Seleccionar ubicación' : 'Tipo de vehículo'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {step === 'location' ? 'Paso 1 de 2' : 'Paso 2 de 2'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${step === 'location' || step === 'vehicle' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'}`}>
              1
            </div>
            <div className={`flex-1 h-1 rounded-full ${step === 'location' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${step === 'vehicle' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              2
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-3">
          {step === 'location' && (
            <LocationPicker onLocationSelected={(lat, lng) => { setLocation({ lat, lng }); setStep('vehicle'); }} />
          )}

          {step === 'vehicle' && location && (
            <div className="space-y-4">
              {/* Location summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 font-medium">Ubicación</p>
                  <p className="text-sm text-blue-800 truncate">
                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  onClick={() => setStep('location')}
                  className="text-xs text-blue-600 hover:bg-blue-100 font-medium px-2.5 py-1.5 rounded-lg transition"
                >
                  Cambiar
                </button>
              </div>

              {/* Vehicle selector */}
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">¿Qué tipo de vehículo es?</p>
                <VehicleLabelSelector onSelect={setLabel} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (step === 'vehicle') setStep('location')
              else onClose()
            }}
            className="px-4 py-3 text-slate-500 font-medium text-sm rounded-xl border border-slate-200 hover:bg-slate-50 transition"
          >
            {step === 'vehicle' ? '← Atrás' : 'Cancelar'}
          </button>

          <button
            onClick={step === 'vehicle' ? handleFinish : undefined}
            disabled={!canProceed || saving}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </>
            ) : step === 'vehicle' ? (
              <>
                <Check className="w-4 h-4" /> Guardar
              </>
            ) : (
              'Siguiente →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
