import { useRef, useState, useEffect } from 'react'
import { Scene3D } from '@/components/three/Scene3D'
import { UploadZone } from '@/components/ui/UploadZone'
import { useViewerStore, DEFAULT_BG } from '@/store/useViewerStore'
import { formatFileSize } from '@/lib/utils'

// ─── Quick swatch palette ────────────────────────────────────────────────────
const QUICK_COLORS = [
  { label: 'Space', value: DEFAULT_BG },
  { label: 'Graphite', value: '#1c1c1e' },
  { label: 'Navy', value: '#0f172a' },
  { label: 'Forest', value: '#0a1f14' },
  { label: 'Plum', value: '#1f0a1a' },
  { label: 'Snow', value: '#f5f5f7' },
]

const SPEED_PRESETS = [
  { label: 'Slow', value: 0.3 },
  { label: 'Normal', value: 1.0 },
  { label: 'Fast', value: 2.5 },
  { label: 'Turbo', value: 5.0 },
]

// ─── Primitives ───────────────────────────────────────────────────────────────

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-[11px] font-semibold text-[var(--apple-text-secondary)] uppercase tracking-[0.06em]">
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="text-[13px] text-[var(--apple-text-secondary)] shrink-0">{label}</span>
      <span className="text-[13px] text-white font-medium truncate text-right">{value}</span>
    </div>
  )
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-1 cursor-pointer select-none group focus:outline-none"
    >
      <span className="text-[13px] text-white">{label}</span>
      <span
        className={`relative w-[42px] h-[26px] rounded-full transition-colors duration-200 ease-out ${
          checked ? 'bg-[#0a84ff]' : 'bg-white/[0.16] group-hover:bg-white/[0.22]'
        }`}
      >
        <span
          className={`absolute top-[2px] left-[2px] w-[22px] h-[22px] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-200 ease-out ${
            checked ? 'translate-x-[16px]' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  )
}

// ─── Background Color Picker ─────────────────────────────────────────────────

/**
 * Validate and normalize a hex string.
 * Accepts: "fff", "#fff", "ffffff", "#ffffff" (case-insensitive).
 * Returns lowercase "#rrggbb" or null if invalid.
 */
function normalizeHex(raw: string): string | null {
  let v = raw.trim().replace(/^#/, '')
  if (!/^[0-9a-fA-F]+$/.test(v)) return null
  if (v.length === 3) v = v.split('').map((c) => c + c).join('')
  if (v.length !== 6) return null
  return `#${v.toLowerCase()}`
}

function HexInput() {
  const { bgColor, setBgColor } = useViewerStore()
  const [draft, setDraft] = useState(bgColor.replace(/^#/, ''))
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep draft synced with store while not editing
  useEffect(() => {
    if (!isFocused) setDraft(bgColor.replace(/^#/, ''))
  }, [bgColor, isFocused])

  const normalized = normalizeHex(draft)
  const isValid = normalized !== null
  const hasChange = isValid && normalized?.toLowerCase() !== bgColor.toLowerCase()
  const canApply = isValid && hasChange

  const apply = () => {
    if (normalized) {
      setBgColor(normalized)
      setDraft(normalized.replace(/^#/, ''))
    }
  }

  const reset = () => {
    setDraft(bgColor.replace(/^#/, ''))
  }

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      {/* Input pill */}
      <div
        className={`flex items-center h-9 rounded-[10px] transition-all duration-150 flex-1 min-w-0 ${
          isFocused
            ? canApply
              ? 'bg-white/[0.08] ring-2 ring-[#0a84ff]'
              : 'bg-white/[0.06] ring-2 ring-white/[0.2]'
            : 'bg-white/[0.04] ring-1 ring-white/[0.1] hover:ring-white/[0.2]'
        } ${!isValid && draft.length > 0 ? '!ring-[#ff453a]' : ''}`}
      >
        <span className="pl-3 pr-1 text-[var(--apple-text-tertiary)] text-[13px] a-mono select-none">
          #
        </span>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) =>
            setDraft(e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6).toLowerCase())
          }
          onFocus={(e) => {
            setIsFocused(true)
            e.target.select()
          }}
          onBlur={() => {
            setIsFocused(false)
            if (!isValid) reset()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canApply) {
              apply()
              e.currentTarget.blur()
            }
            if (e.key === 'Escape') {
              reset()
              e.currentTarget.blur()
            }
          }}
          maxLength={6}
          spellCheck={false}
          autoCapitalize="characters"
          autoComplete="off"
          className="flex-1 bg-transparent text-[13px] text-white a-mono uppercase tracking-tight outline-none w-full min-w-0 py-2 pr-3 placeholder:text-[var(--apple-text-tertiary)]/40"
          placeholder="000000"
          aria-label="Hex color value"
        />
      </div>

      {/* Apply button */}
      <button
        onClick={() => {
          apply()
          inputRef.current?.blur()
        }}
        disabled={!canApply}
        className={`h-9 px-3.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 shrink-0 ${
          canApply
            ? 'bg-[#0a84ff] hover:bg-[#409cff] active:bg-[#0070d8] text-white shadow-[0_1px_3px_rgba(10,132,255,0.35)]'
            : 'bg-white/[0.06] text-[var(--apple-text-tertiary)] cursor-not-allowed'
        }`}
        title="Apply hex color"
      >
        Apply
      </button>
    </div>
  )
}

function BackgroundPicker() {
  const { bgColor, setBgColor } = useViewerStore()
  const nativeRef = useRef<HTMLInputElement>(null)

  return (
    <Section title="Background">
      <div className="a-card p-3 space-y-3">
        {/* Swatch preview that opens native color wheel */}
        <button
          onClick={() => nativeRef.current?.click()}
          title="Open color wheel"
          className="relative w-full h-9 rounded-[10px] ring-1 ring-white/[0.12] hover:ring-white/[0.22] transition-all overflow-hidden flex items-center justify-between px-3 group"
          style={{ background: bgColor }}
          aria-label="Open color wheel"
        >
          {/* Contrast overlay so label is always readable */}
          <span className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/40 pointer-events-none" />
          <span className="relative text-[11px] font-medium text-white/90 a-mono uppercase tracking-wider drop-shadow-sm">
            {bgColor}
          </span>
          <span className="relative text-[10px] text-white/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
            Open wheel ↗
          </span>
          <input
            ref={nativeRef}
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            className="sr-only"
          />
        </button>

        {/* Editable HEX + Apply button */}
        <div className="flex items-center gap-2">
          <HexInput />
        </div>

        <div className="a-divider" />

        {/* Swatches */}
        <div className="grid grid-cols-6 gap-2">
          {QUICK_COLORS.map((c) => {
            const isActive = bgColor.toLowerCase() === c.value.toLowerCase()
            return (
              <button
                key={c.value}
                title={c.label}
                onClick={() => setBgColor(c.value)}
                className={`aspect-square rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 ${
                  isActive
                    ? 'ring-2 ring-[#0a84ff] ring-offset-2 ring-offset-[#2c2c2e]'
                    : 'ring-1 ring-white/[0.08] hover:ring-white/[0.2]'
                }`}
                style={{ background: c.value }}
                aria-label={c.label}
              />
            )
          })}
          {/* Custom color rainbow swatch */}
          <button
            title="Custom color"
            onClick={() => nativeRef.current?.click()}
            className="aspect-square rounded-lg ring-1 ring-white/[0.08] hover:ring-white/[0.2] hover:scale-105 active:scale-95 transition-all relative overflow-hidden"
            style={{ background: 'conic-gradient(from 90deg, #ff453a, #ff9f0a, #ffd60a, #30d158, #0a84ff, #5e5ce6, #bf5af2, #ff453a)' }}
            aria-label="Custom color"
          />
        </div>
      </div>
    </Section>
  )
}

// ─── Speed Slider ────────────────────────────────────────────────────────────

function SpeedControl() {
  const { spinSpeed, setSpinSpeed } = useViewerStore()
  const SPEED_MIN = 0.1
  const SPEED_MAX = 5.0
  const pct = ((spinSpeed - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)) * 100

  return (
    <Section
      title="Rotation Speed"
      action={<span className="text-[13px] text-white font-semibold a-mono">{spinSpeed.toFixed(1)}×</span>}
    >
      <div className="a-card p-3 space-y-3">
        {/* Slider */}
        <div>
          <input
            type="range"
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={0.1}
            value={spinSpeed}
            onChange={(e) => setSpinSpeed(parseFloat(e.target.value))}
            style={{
              background: `linear-gradient(to right, #0a84ff 0%, #0a84ff ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`,
            }}
          />
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-[var(--apple-text-tertiary)]">0.1×</span>
            <span className="text-[10px] text-[var(--apple-text-tertiary)]">5.0×</span>
          </div>
        </div>

        <div className="a-divider" />

        {/* Preset chips */}
        <div className="grid grid-cols-4 gap-1.5">
          {SPEED_PRESETS.map((p) => {
            const isActive = Math.abs(spinSpeed - p.value) < 0.05
            return (
              <button
                key={p.value}
                onClick={() => setSpinSpeed(p.value)}
                className={`h-7 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0a84ff] text-white shadow-sm'
                    : 'bg-white/[0.06] text-[var(--apple-text-secondary)] hover:bg-white/[0.1] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const { model, clearModel, showStats, setShowStats, showGrid, setShowGrid } = useViewerStore()

  return (
    <aside className="w-[320px] flex-shrink-0 flex flex-col a-panel rounded-[20px] h-full overflow-hidden">
      {/* Title bar */}
      <header className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#0a84ff] to-[#5e5ce6] flex items-center justify-center shadow-[0_2px_8px_rgba(10,132,255,0.35)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 7l10 5 10-5M12 22V12" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-white a-title leading-tight">
              3D Recorder
            </h1>
            <p className="text-[11px] text-[var(--apple-text-tertiary)] mt-0.5">
              Upload · View · Capture
            </p>
          </div>
        </div>
      </header>

      <div className="a-divider" />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

        <UploadZone />

        {model && (
          <Section title="Model">
            <div className="a-card px-3 py-2">
              <Row label="Name" value={model.name} />
              <Row label="Format" value={model.format.toUpperCase()} />
              <Row label="Size" value={formatFileSize(model.size)} />
            </div>
          </Section>
        )}

        <BackgroundPicker />

        <SpeedControl />

        <Section title="Display">
          <div className="a-card px-3 py-1 divide-y divide-[var(--apple-border)]">
            <Switch label="Show Grid" checked={showGrid} onChange={setShowGrid} />
            <Switch label="Show FPS" checked={showStats} onChange={setShowStats} />
          </div>
        </Section>

        {model && (
          <button
            onClick={clearModel}
            className="w-full h-9 rounded-[10px] text-[13px] font-medium text-[#ff453a] hover:bg-[#ff453a]/10 active:bg-[#ff453a]/5 transition-colors"
          >
            Remove Model
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="a-divider" />
      <footer className="px-5 py-3">
        <p className="text-[11px] text-[var(--apple-text-tertiary)] text-center">
          GLB · STL &nbsp;·&nbsp; Max 30s &nbsp;·&nbsp; MP4/WebM
        </p>
      </footer>
    </aside>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black p-4 gap-4">
      <Sidebar />
      <main className="flex-1 min-w-0 rounded-[20px] overflow-hidden relative shadow-[var(--apple-shadow-lg)]">
        <Scene3D />
      </main>
    </div>
  )
}
