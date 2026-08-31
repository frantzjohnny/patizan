/**
 * Patizan Records — Centralized Local Studio Images Configuration
 * Source of Truth for all official facility photography across the website.
 *
 * Files are located statically in: /public/images/studio/
 */

export interface StudioRoomImage {
  id: string
  name: string
  category: string
  imageSrc: string
  altText: string
  description: string
  isFeatured?: boolean
  homepageSpan?: string
}

/**
 * Official default OpenGraph / Twitter social preview image
 */
export const DEFAULT_STUDIO_SEO_IMAGE = '/images/studio/control-room.jpg'

/**
 * Centralized list of Studio facility spaces and photographs
 */
export const STUDIO_ROOM_IMAGES: StudioRoomImage[] = [
  {
    id: 'control-room',
    name: 'Control Room A',
    category: 'Control Room',
    imageSrc: '/images/studio/control-room.jpg',
    altText: 'Patizan Records Main Control Room A in Tamarac FL',
    description:
      'The acoustic nerve center of Patizan Records. Engineered with surgical acoustic treatment, precision midfield monitoring, and seamless hybrid digital/analog signal routing.',
    isFeatured: true,
    homepageSpan: 'lg:col-span-2 lg:row-span-2',
  },
  {
    id: 'recording-booth',
    name: 'Vocal & Recording Booth',
    category: 'Recording Booth',
    imageSrc: '/images/studio/recording-booth.jpg',
    altText: 'Patizan Records Acoustically Isolated Vocal Recording Booth',
    description:
      'Floating-floor vocal booth built for pristine vocal clarity, zero noise floor, and total acoustic separation. Equipped with industry-standard condenser and dynamic microphones.',
    homepageSpan: '',
  },
  {
    id: 'podcast-setup',
    name: 'Podcast & Creator Suite',
    category: 'Podcast Suite',
    imageSrc: '/images/studio/podcast-setup.jpg',
    altText: 'Patizan Records Multi-Microphone 4K Video Podcast Suite',
    description:
      'Turnkey broadcast suite configured for 4-mic studio discussions, 4K multi-angle video capture, live stream routing, and rapid content turnaround.',
    homepageSpan: '',
  },
  {
    id: 'equipment',
    name: 'Analog Hardware & Microphones',
    category: 'Equipment & Gear',
    imageSrc: '/images/studio/equipment.jpg',
    altText: 'Patizan Records Studio Microphones Analog Preamps and Outboard Gear',
    description:
      'Carefully curated outboard processing, warm analog preamplifiers, high-end studio converters, and classic microphone selections.',
    homepageSpan: '',
  },
  {
    id: 'live-room',
    name: 'Live Tracking Room',
    category: 'Live Room',
    imageSrc: '/images/studio/live-room.jpg',
    altText: 'Patizan Records Live Tracking Room for Instruments and Ensembles',
    description:
      'Spacious live room with tunable natural acoustics designed for drum tracking, brass, acoustic guitars, and multi-instrumentalist band sessions.',
  },
  {
    id: 'studio-interior',
    name: 'VIP Creator Lounge & Interior',
    category: 'Studio Lounge',
    imageSrc: '/images/studio/studio-interior.jpg',
    altText: 'Patizan Records VIP Studio Artist Lounge and Production Interior',
    description:
      'Comfortable private lounge with ambient mood lighting, high-speed Wi-Fi, refreshment station, and client workspace between tracking takes.',
  },
  {
    id: 'studio-exterior',
    name: 'Facility Exterior & Access',
    category: 'Studio Facility',
    imageSrc: '/images/studio/studio-exterior.jpg',
    altText: 'Patizan Records Commercial Recording Studio Facility in Tamarac Florida',
    description:
      'Centrally located in Tamarac, Broward County, Florida with dedicated private parking, secure access, and professional commercial studio facilities.',
  },
]

/**
 * Universal fallback handler for studio images
 * If a custom photo hasn't been placed in /public/images/studio/ yet,
 * smoothly fall back to the branded local SVG asset.
 */
export const STUDIO_FALLBACK_IMAGE = '/images/studio-placeholder.svg'

export function handleStudioImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget
  if (target.src !== window.location.origin + STUDIO_FALLBACK_IMAGE) {
    target.src = STUDIO_FALLBACK_IMAGE
  }
}
