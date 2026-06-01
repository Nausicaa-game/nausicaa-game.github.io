import { useI18n } from '../i18n/I18nContext'
import type { UnitType } from '../types/game'
import { UNIT_STATS } from '../engine/units'

interface UnitCardProps {
  type: UnitType
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}

export default function UnitCard({ type, selected, onClick, disabled }: UnitCardProps) {
  const { t } = useI18n()
  const stats = UNIT_STATS[type]
  const name = t(stats.nameKey)

  return (
    <div
      className={`card${selected ? ' selected' : ''}`}
      data-type={type}
      data-cost={stats.cost}
      onClick={disabled ? undefined : onClick}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer' }}
    >
      <div
        className="card-image"
        style={{ backgroundImage: `url('/assets/pions/${type}.svg')` }}
      />
      <div className="card-details">
        <div className="card-name">{name}</div>
        <div className="card-cost">{stats.cost} Mana</div>
      </div>
    </div>
  )
}
