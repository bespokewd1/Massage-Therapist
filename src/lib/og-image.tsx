import satori from 'satori';
import sharp from 'sharp';
import { getBrandAssets, OG_WIDTH, OG_HEIGHT, type OgCard } from './seo';

const PAPER = '#fafbfc';
const WARM_PAPER = '#faf8f5';
const INK = '#1a1a1a';
const PINK = '#f3117e';
const ORCHID = '#f984ef';
const PANEL_WIDTH = 730;
const PHOTO_WIDTH = OG_WIDTH - PANEL_WIDTH;
const COPY_HEIGHT = 338;

export async function renderOgImage(card: OgCard): Promise<Buffer> {
  if (card.override) {
    // Complete uploaded cards keep their text and original composition.
    return sharp(card.photo)
      .rotate()
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: 'contain',
        background: WARM_PAPER,
      })
      .png()
      .toBuffer();
  }

  const assets = await getBrandAssets();
  const [photo, logo] = await Promise.all([
    sharp(card.photo)
      .rotate()
      .resize(PHOTO_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 90 })
      .toBuffer(),
    sharp(assets.logo)
      .resize(192, 192, { fit: 'contain', background: '#00000000' })
      .png()
      .toBuffer(),
  ]);
  const headline = card.headline.trim();
  let fontSize =
    headline.length > 85
      ? 42
      : headline.length > 60
        ? 48
        : headline.length > 40
          ? 54
          : 62;
  let svg = '';
  let copyHeight = 0;

  // Measure actual wrapped copy, so long article titles are never truncated.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    copyHeight = 0;
    svg = await satori(
      <div
        style={{
          display: 'flex',
          width: OG_WIDTH,
          height: OG_HEIGHT,
          position: 'relative',
          background: PAPER,
          color: INK,
          fontFamily: 'Open Sans',
          fontWeight: 400,
        }}
      >
        <img
          src={`data:image/jpeg;base64,${photo.toString('base64')}`}
          width={PHOTO_WIDTH}
          height={OG_HEIGHT}
          style={{ position: 'absolute', right: 0, top: 0 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            left: 0,
            top: 0,
            width: PANEL_WIDTH,
            height: OG_HEIGHT,
            background: PAPER,
          }}
        >
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              left: 0,
              top: 0,
              width: PANEL_WIDTH,
              height: 12,
              background: PINK,
            }}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              left: 44,
              top: 38,
            }}
          >
            <img
              src={`data:image/png;base64,${logo.toString('base64')}`}
              width={96}
              height={96}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 20,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1.2 }}>
                Stone Massage
              </div>
              <div style={{ fontSize: 20, marginTop: 8, color: '#353535' }}>
                Edmonton, Alberta
              </div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'absolute',
              left: 48,
              top: 166,
              width: PANEL_WIDTH - 96,
              height: COPY_HEIGHT,
            }}
          >
            <div
              id="og-copy"
              style={{
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontSize,
                  fontWeight: 700,
                  lineHeight: 1.12,
                  letterSpacing: -1.2,
                  whiteSpace: 'pre-wrap',
                  overflowWrap: 'anywhere',
                  textWrap: 'balance',
                  flexShrink: 0,
                }}
              >
                {headline}
              </div>
              {card.detail && (
                <div
                  style={{
                    fontSize: 23,
                    lineHeight: 1.35,
                    color: '#353535',
                    marginTop: 20,
                    flexShrink: 0,
                  }}
                >
                  {card.detail}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'absolute',
              left: 48,
              right: 48,
              bottom: 34,
              paddingTop: 20,
              borderTop: '1px solid #e8e8e8',
            }}
          >
            {card.action && (
              <div
                style={{ display: 'flex', alignItems: 'center', fontSize: 21 }}
              >
                {card.action}
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  style={{ marginLeft: 10 }}
                >
                  <path
                    d="M4 12h15m-6-6 6 6-6 6"
                    fill="none"
                    stroke={INK}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <div style={{ fontSize: 19, fontWeight: 700, marginLeft: 'auto' }}>
              stonemassage.ca
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            right: 0,
            top: 0,
            width: PHOTO_WIDTH,
            height: 12,
            background: ORCHID,
          }}
        />
      </div>,
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: [
          {
            name: 'Open Sans',
            data: assets.regular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Open Sans',
            data: assets.bold,
            weight: 700,
            style: 'normal',
          },
        ],
        onNodeDetected(node) {
          if (node.props.id === 'og-copy') copyHeight = node.height;
        },
      }
    );
    if (copyHeight <= COPY_HEIGHT) break;
    fontSize = Math.max(
      30,
      Math.floor(fontSize * (COPY_HEIGHT / copyHeight)) - 2
    );
  }

  if (copyHeight > COPY_HEIGHT) {
    throw new Error(`Social card copy does not fit: ${card.key}`);
  }
  return sharp(Buffer.from(svg)).png().toBuffer();
}
