import { useGame } from '../hooks/useGame'
import { useI18n } from '../i18n/I18nContext'
import { UNIT_STATS } from '../engine/units'

export default function UnitInfoPanel() {
  const { selectedUnit } = useGame()
  const { t } = useI18n()

  if (!selectedUnit) {
    return (
      <div className="unit-info" id="unit-info">
        <h4>{t('select_unit_info')}</h4>
        <div className="unit-details">{t('select_unit')}</div>
      </div>
    )
  }

  const { unit } = selectedUnit
  const stats = UNIT_STATS[unit.type]
  const name = t(stats.nameKey)
  const desc = t(stats.descriptionKey)
  const label = `${name} (${t('player')} ${unit.player})`

  const movementText = t(`${stats.movement}_movement`, stats.movement)
  const attackText = t(`${stats.attack}_attack`, stats.attack)

  return (
    <div className="unit-info" id="unit-info">
      <h4>{t('select_unit_info')}</h4>
      <div className="unit-details">
        <div className="unit-info-name">{label}</div>
        <div className="unit-info-health">{t('health')}: {unit.health}/{stats.health}</div>
        {stats.movement !== 'none' && (
          <div className="unit-info-stat">{t('move')}: {movementText}</div>
        )}
        {stats.attack !== 'none' && (
          <div className="unit-info-stat">{t('attack')}: {attackText}</div>
        )}
        <div className="unit-info-desc">{desc}</div>
        <div className="unit-status">
          {unit.justSpawned && <span className="status-tag">{t('just_spawned')}</span>}
          {unit.hasMoved && <span className="status-tag">{t('has_moved')}</span>}
          {unit.hasAttacked && <span className="status-tag">{t('has_attacked')}</span>}
          {unit.usedAbility && <span className="status-tag">{t('ability_used')}</span>}
        </div>
      </div>
    </div>
  )
}
