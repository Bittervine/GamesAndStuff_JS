import { config } from '../orbitals_config.js';

export function pushEvent(state, type, payload = {}) {
  if (!config.debug || !state || !Array.isArray(state.eventLog)) {
    return;
  }
  state.eventLog.push({
    frame: state.frameIndex,
    time: state.time,
    type,
    ...payload
  });
}

function formatEventPoint(point) {
  if (!point) {
    return '(n/a)';
  }
  return `(${Number(point.x).toFixed(2)}, ${Number(point.y).toFixed(2)}, ${Number(point.z).toFixed(2)})`;
}

export function formatCombatLog(state) {
  if (!config.debug) {
    return '';
  }
  const lines = [];
  const events = Array.isArray(state?.eventLog) ? state.eventLog : [];
  for (const event of events) {
    const stamp = `f${event.frame} t=${Number(event.time).toFixed(2)}`;
    if (event.type === 'mothership-spawn') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} spawn planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-arrived') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} arrived planet=${event.planetIndex} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-reoriented') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} reoriented planet=${event.planetIndex} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'mothership-planet-cross') {
      lines.push(
        `[${stamp}] M#${event.mothershipId} crossed planet=${event.planetIndex}(${event.planetName || 'n/a'}) prev=${formatEventPoint(event.previousPosition)} now=${formatEventPoint(event.currentPosition)}`
      );
      continue;
    }
    if (event.type === 'enemy-spawn') {
      lines.push(
        `[${stamp}] E#${event.enemyId} spawn kind=${event.kind} family=${event.family} fromM=${event.spawnedByMothershipId ?? '-'} planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) pos=${formatEventPoint(event.position)} alt=${event.altitude == null ? 'n/a' : Number(event.altitude).toFixed(2)}`
      );
      continue;
    }
    if (event.type === 'enemy-death') {
      lines.push(
        `[${stamp}] E#${event.enemyId} death cause=${event.cause} age=${event.ageSeconds == null ? 'n/a' : Number(event.ageSeconds).toFixed(2)} family=${event.family} fromM=${event.parentMothershipId ?? '-'} planet=${event.targetPlanetIndex}(${event.targetPlanetName || 'n/a'}) alt=${event.altitude == null ? 'n/a' : Number(event.altitude).toFixed(2)} pos=${formatEventPoint(event.position)}`
      );
      continue;
    }
    if (event.type === 'enemy-crash') {
      lines.push(`[${stamp}] E#${event.enemyId} crash kind=${event.kind} family=${event.family}`);
      continue;
    }
    if (event.type === 'encounter-start') {
      lines.push(`[${stamp}] encounter#${event.encounterId} start type=${event.encounterType} anchor=${event.anchorKind}`);
      continue;
    }
    if (event.type === 'encounter-success' || event.type === 'encounter-fail' || event.type === 'encounter-end') {
      lines.push(`[${stamp}] encounter#${event.encounterId} ${event.type.replace('encounter-', '')} type=${event.encounterType} status=${event.status || ''} released=${event.totalReleased ?? '-'} destroyed=${event.totalDestroyed ?? '-'}`);
      continue;
    }
    if (event.type === 'planet-invasion-start' || event.type === 'planet-invasion-cleared') {
      lines.push(`[${stamp}] planet-invasion#${event.encounterId} ${event.type.replace('planet-invasion-', '')} planet=${event.planetIndex} released=${event.totalReleased ?? '-'} destroyed=${event.totalDestroyed ?? '-'}`);
      continue;
    }
    if (event.type.startsWith('presentation-')) {
      lines.push(`[${stamp}] presentation E#${event.enemyId} ${event.type.replace('presentation-', '')} kind=${event.kind} phase=${event.phase} shootable=${event.shootableFrames ?? 0} minAngle=${event.minAngleToPlayer == null ? '-' : Number(event.minAngleToPlayer).toFixed(1)} minDist=${event.minDistanceToPlayer == null ? '-' : Number(event.minDistanceToPlayer).toFixed(1)} reason=${event.failureReason || ''}`);
      continue;
    }
    if (event.type.startsWith('objective-')) {
      lines.push(`[${stamp}] objective E#${event.enemyId} ${event.type.replace('objective-', '')} encounter=${event.encounterId} target=${event.targetEntityId ?? '-'}`);
    }
  }
  return lines.join('\n');
}
