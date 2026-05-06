'use client';

import { motion } from 'framer-motion';

const VINEYARDS = [
  {
    flag: '🇫🇷',
    country: 'France',
    korean: '프랑스',
    stat: '금액 1위 · $173M',
    img: 'https://images.pexels.com/photos/18248851/pexels-photo-18248851.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '프랑스 포도밭',
  },
  {
    flag: '🇨🇱',
    country: 'Chile',
    korean: '칠레',
    stat: '수입량 1위 · 22.54%',
    img: 'https://images.pexels.com/photos/2339180/pexels-photo-2339180.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '칠레 포도밭',
  },
  {
    flag: '🇮🇹',
    country: 'Italy',
    korean: '이탈리아',
    stat: '모스카토 · 키안티',
    img: 'https://images.pexels.com/photos/5370804/pexels-photo-5370804.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '이탈리아 토스카나 포도밭',
  },
  {
    flag: '🇳🇿',
    country: 'New Zealand',
    korean: '뉴질랜드',
    stat: '화이트 1위 · +10%↑',
    img: 'https://images.pexels.com/photos/19065636/pexels-photo-19065636.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: '뉴질랜드 포도밭',
  },
];

export default function VineyardStrip() {
  return (
    <section style={{ background: 'var(--color-tile-dark-2)', padding: 'clamp(48px,7vw,80px) 0' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        style={{ marginBottom: 'clamp(28px,4vw,48px)', padding: '0 24px' }}
      >
        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-gold)', textTransform: 'uppercase', marginBottom: 10 }}>
          Vineyards of the World
        </p>
        <h2 style={{
          fontSize: 'clamp(24px,3.5vw,38px)',
          fontWeight: 600,
          color: 'var(--color-on-dark)',
          letterSpacing: '-0.374px',
          lineHeight: 1.1,
        }}>
          당신이 마신 와인이 태어난 땅
        </h2>
      </motion.div>

      {/* Photo grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 3,
        padding: '0 clamp(0px, 2vw, 0px)',
      }}>
        {VINEYARDS.map((v, i) => (
          <motion.div
            key={v.country}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            viewport={{ once: true }}
            style={{
              position: 'relative',
              aspectRatio: '3/4',
              overflow: 'hidden',
              cursor: 'default',
            }}
          >
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.img}
              alt={v.alt}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.62) saturate(1.15)',
                transition: 'transform 700ms ease, filter 500ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.07)';
                (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.78) saturate(1.25)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLImageElement).style.filter = 'brightness(0.62) saturate(1.15)';
              }}
            />

            {/* Overlay gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(4,1,10,0.88) 0%, rgba(4,1,10,0.1) 55%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Content */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: 'clamp(12px,2vw,20px)',
            }}>
              <div style={{ fontSize: 'clamp(18px,3vw,28px)', marginBottom: 4 }}>{v.flag}</div>
              <div style={{
                fontSize: 'clamp(13px,1.8vw,20px)',
                fontWeight: 600,
                color: 'var(--color-on-dark)',
                letterSpacing: '-0.374px',
                marginBottom: 4,
              }}>
                {v.korean}
              </div>
              <div style={{ fontSize: 'clamp(9px,1vw,12px)', color: '#C9A84C', letterSpacing: '0.06em' }}>
                {v.stat}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Atmospheric wine bar photo strip */}
      <div style={{
        position: 'relative',
        height: 'clamp(160px,22vw,260px)',
        marginTop: 3,
        overflow: 'hidden',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/34981128/pexels-photo-34981128.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="와인 서비스"
          loading="lazy"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
            filter: 'brightness(0.38) saturate(1.1)',
            display: 'block',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(4,1,10,0.75) 0%, transparent 35%, transparent 65%, rgba(4,1,10,0.75) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8,
        }}>
          <div style={{ fontSize: 'clamp(10px,1.2vw,13px)', letterSpacing: '0.3em', color: '#C9A84C', textTransform: 'uppercase' }}>
            Korea Wine Market 2025
          </div>
          <div style={{
            fontSize: 'clamp(18px,3.5vw,36px)',
            fontWeight: 600, color: 'var(--color-on-dark)', textAlign: 'center',
            letterSpacing: '-0.374px', lineHeight: 1.1,
          }}>
            전문가가 선택한 와인을<br />지도 위에 기록하다
          </div>
        </div>
      </div>
    </section>
  );
}
