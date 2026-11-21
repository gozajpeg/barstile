let clockOffset = 0;

/**
 * Synchronizes client clock offset against a server timestamp, Date string, or HTTP Response/Headers.
 * Calculates: clockOffset = serverTime - localTime
 *
 * @param {number | string | Date | Response | Headers | { headers?: any }} [serverSource]
 * @returns {number} The updated clock offset in milliseconds
 */
export function syncServerTime(serverSource) {
  if (!serverSource) return clockOffset;
  let serverMs = null;

  if (typeof serverSource === 'number' && Number.isFinite(serverSource)) {
    serverMs = serverSource;
  } else if (typeof serverSource === 'string') {
    const parsed = Date.parse(serverSource);
    if (!Number.isNaN(parsed)) serverMs = parsed;
  } else if (serverSource instanceof Date) {
    serverMs = serverSource.getTime();
  } else {
    const headers = serverSource.headers || serverSource;
    if (typeof headers?.get === 'function') {
      const ageStr = headers.get('age') || headers.get('Age');
      if (ageStr !== null && ageStr !== undefined) {
        const ageSec = Number.parseInt(ageStr, 10);
        if (!Number.isNaN(ageSec) && ageSec > 0) return clockOffset;
      }
      const dateHdr = headers.get('date') || headers.get('Date');
      if (dateHdr) {
        const parsed = Date.parse(dateHdr);
        if (!Number.isNaN(parsed)) serverMs = parsed;
      }
    }
  }

  if (serverMs !== null) {
    clockOffset = serverMs - Date.now();
  }

  return clockOffset;
}

/**
 * Returns estimated server time in milliseconds, adjusted for client/server clock skew.
 * @returns {number}
 */
export function getServerTime() {
  return Date.now() + clockOffset;
}

/**
 * Returns current clock offset in milliseconds (serverTime - localTime).
 * @returns {number}
 */
export function getClockOffset() {
  return clockOffset;
}

/**
 * Resets clock offset to 0.
 */
export function resetClockOffset() {
  clockOffset = 0;
}
