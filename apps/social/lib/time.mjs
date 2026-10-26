// 현지 날짜·시각(tz) → UTC ISO. 실행 서버의 시간대와 무관(Intl 로 tz 오프셋 계산, DST 포함).
function tzOffsetMin(ms, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 6e4;
}
export function localToUtc(date, hour, tz) {
  const [y, m, d] = date.split('-').map(Number);
  const wall = Date.UTC(y, m - 1, d, hour);
  let ms = wall - tzOffsetMin(wall, tz) * 6e4;
  ms = wall - tzOffsetMin(ms, tz) * 6e4; // DST 경계 보정
  return new Date(ms).toISOString();
}
