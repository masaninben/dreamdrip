interface ReverseGeocodeResult {
  country: string | null
  region: string | null
  city: string | null
}

interface NominatimResponse {
  address?: {
    country_code?: string
    country?: string
    state?: string
    province?: string
    region?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string
  }
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  precision: 'city' | 'region' = 'city',
): Promise<ReverseGeocodeResult> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))
  url.searchParams.set('format', 'json')
  url.searchParams.set('zoom', precision === 'city' ? '10' : '6')
  url.searchParams.set('accept-language', 'ja')

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error('reverse geocoding failed')
  }
  const data = (await res.json()) as NominatimResponse
  const addr = data.address ?? {}

  const country = addr.country_code ? addr.country_code.toUpperCase() : null
  const region = addr.state ?? addr.province ?? addr.region ?? null
  const city =
    precision === 'region'
      ? null
      : addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.suburb ?? null

  return { country, region, city }
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('お使いの環境では位置情報を取得できません。'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 5 * 60 * 1000,
    })
  })
}
