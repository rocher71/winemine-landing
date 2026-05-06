import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'WineMine — Your wine journey, mapped.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage() {
  const playfair = await fetch(
    'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXBYf9lW4e-A.woff'
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(170deg, #060115 0%, #120828 50%, #060115 100%)',
          display: 'flex',
          fontFamily: 'Inter, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 배경 글로우 */}
        <div style={{
          position: 'absolute',
          width: '800px', height: '800px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,26,42,0.12) 0%, transparent 70%)',
          top: '50%', left: '35%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* 좌측: Recap 스토리카드 UI 재현 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          width: '420px',
          flexShrink: 0,
          padding: '54px 40px 54px 72px',
        }}>
          {/* Instagram 스타일 진행 바 */}
          <div style={{
            height: 2,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 1,
            marginBottom: 14,
            width: '100%',
          }}>
            <div style={{ height: '100%', width: '65%', background: '#F5F0E8', borderRadius: 1 }} />
          </div>

          {/* 로고 행 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B1A2A, #C9A84C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: '#F5F0E8', flexShrink: 0,
            }}>W</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F0E8' }}>WineMine</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>지금</span>
          </div>

          {/* 제목 */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.25em', color: '#C9A84C',
              textTransform: 'uppercase', marginBottom: 6,
            }}>
              My Wine Journey
            </div>
            <div style={{
              fontFamily: 'Playfair Display',
              fontSize: 34, fontWeight: 400, color: '#F5F0E8',
              lineHeight: 1.1,
            }}>
              2025
            </div>
            <div style={{
              fontFamily: 'Playfair Display',
              fontSize: 34, fontWeight: 400, color: '#F5F0E8',
              lineHeight: 1.1, marginBottom: 10,
            }}>
              Recap
            </div>
            <div style={{ width: 32, height: 1, background: '#C9A84C', margin: '0 auto' }} />
          </div>

          {/* 세계 지도 영역 (간략화된 SVG) */}
          <div style={{
            height: 108,
            background: '#080220',
            borderRadius: 8,
            border: '1px solid rgba(201,168,76,0.18)',
            marginBottom: 14,
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
          }}>
            <svg viewBox="0 0 420 210" style={{ width: '100%', height: '100%' }}>
              <rect width="420" height="210" fill="#080220" />
              {/* 북미 */}
              <ellipse cx="92" cy="82" rx="58" ry="48" fill="#1C0840" />
              {/* 남미 */}
              <ellipse cx="112" cy="154" rx="33" ry="44" fill="#1C0840" />
              {/* 칠레 (와인) */}
              <ellipse cx="102" cy="162" rx="11" ry="28" fill="#D42040" fillOpacity="0.65" />
              {/* 유럽 (와인 강조) */}
              <ellipse cx="212" cy="66" rx="26" ry="22" fill="#D42040" fillOpacity="0.9" />
              {/* 아프리카 */}
              <ellipse cx="218" cy="138" rx="30" ry="44" fill="#1C0840" />
              {/* 남아공 */}
              <ellipse cx="220" cy="174" rx="14" ry="12" fill="#D42040" fillOpacity="0.4" />
              {/* 아시아 */}
              <ellipse cx="312" cy="82" rx="78" ry="52" fill="#1C0840" />
              {/* 호주 */}
              <ellipse cx="352" cy="158" rx="28" ry="20" fill="#1C0840" />
              {/* 비네트 오버레이 */}
              <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
                <stop offset="45%" stopColor="transparent" />
                <stop offset="100%" stopColor="#06011580" />
              </radialGradient>
              <rect width="420" height="210" fill="url(#vignette)" />
            </svg>
          </div>

          {/* 통계 행 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: '12px 8px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>82</div>
              <div style={{ fontSize: 10, color: '#9B8B7A', marginTop: 3 }}>병</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>15</div>
              <div style={{ fontSize: 10, color: '#9B8B7A', marginTop: 3 }}>국가</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#F5F0E8', lineHeight: 1 }}>7</div>
              <div style={{ fontSize: 10, color: '#9B8B7A', marginTop: 3 }}>개월</div>
            </div>
          </div>
        </div>

        {/* 세로 구분선 */}
        <div style={{
          width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)',
          alignSelf: 'stretch',
          margin: '0 0',
          flexShrink: 0,
        }} />

        {/* 우측: 브랜딩 */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '0 72px 0 64px',
        }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.25em', color: '#C9A84C',
            textTransform: 'uppercase', marginBottom: 20,
          }}>
            Your wine journey
          </div>

          <div style={{
            fontFamily: 'Playfair Display',
            fontSize: 80, fontWeight: 700, color: '#F5F0E8',
            letterSpacing: '-0.02em', lineHeight: 1,
            marginBottom: 28,
          }}>
            WineMine
          </div>

          <div style={{
            width: 64, height: 2,
            background: 'linear-gradient(90deg, #C9A84C, transparent)',
            marginBottom: 28,
          }} />

          <div style={{
            fontSize: 24, color: '#D4C5B0',
            lineHeight: 1.55, marginBottom: 32,
          }}>
            와인 라벨을 찍으면{'\n'}세계가 물든다
          </div>

          <div style={{
            fontSize: 14, color: '#9B8B7A',
            letterSpacing: '0.08em',
          }}>
            mapped.
          </div>
        </div>

        {/* 상단 골드 라인 */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #C9A84C 40%, #C9A84C 60%, transparent 100%)',
        }} />
        {/* 하단 골드 라인 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #C9A84C 40%, #C9A84C 60%, transparent 100%)',
        }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Playfair Display', data: playfair, style: 'normal', weight: 700 },
      ],
    }
  );
}
