import type { Category, Offering, Project, SiteProfile, Testimonial } from './types';

const demoVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const demoNote = 'Sample footage demonstration. Replace this with one of Saurav’s original edits before launch.';

export const defaultProfile: SiteProfile = {
  displayName: 'Saurav Gusain',
  roleTitle: 'Independent video editor',
  location: 'India',
  heroEyebrow: 'Independent video editor',
  heroHeadline: 'Turning raw footage into stories that',
  heroHighlight: 'hit different.',
  heroCopy:
    'I’m Saurav Gusain, a video editor drawn to the moments between the cuts. I shape footage into cinematic stories, thoughtful short-form edits, and work that stays with you.',
  aboutEyebrow: 'Behind the timeline',
  aboutTitle: 'Good edits make you feel something.',
  aboutParagraphs: [
    'I’m Saurav, an aspiring professional editor building a practice around visual storytelling. I like finding the natural pulse in a scene — the look before a line, the breath between beats, the sound that gives an image its weight.',
    'Every project starts with listening. The edit follows the story, not a formula. I’m always learning, refining my eye, and looking for the next idea worth shaping.',
  ],
  tools: ['DaVinci Resolve', 'Premiere Pro', 'Storytelling', 'Color & Sound'],
  process: [
    { title: 'Listen', copy: 'We start with the story, the audience, and the feeling you want people to leave with.' },
    { title: 'Assemble', copy: 'A first cut finds the rhythm — what stays, what goes, and where the emotion lives.' },
    { title: 'Refine', copy: 'Color, sound, and pacing get the same attention as the picture. Details carry the cut.' },
    { title: 'Deliver', copy: 'Clean masters, platform-ready versions, and a finish you can publish with confidence.' },
  ],
  contactEyebrow: 'Have a story in mind?',
  contactTitle: 'Let’s make it move.',
  contactCopy: 'Have a project or an idea taking shape? I’d love to hear about it.',
  email: '',
  instagram: '',
};

export const fallbackCategories: Category[] = [
  { id: 'demo-cinematic', slug: 'cinematic-edits', name: 'Cinematic Edits', sortOrder: 1 },
  { id: 'demo-reels', slug: 'reels-shorts', name: 'Reels & Shorts', sortOrder: 2 },
  { id: 'demo-docs', slug: 'documentaries', name: 'Documentaries', sortOrder: 3 },
  { id: 'demo-real-estate', slug: 'real-estate', name: 'Real Estate', sortOrder: 4 },
  { id: 'demo-commercial', slug: 'commercials-ads', name: 'Commercials & Ads', sortOrder: 5 },
  { id: 'demo-other', slug: 'other', name: 'Other', sortOrder: 6 },
];

export const demoProjects: Project[] = [
  {
    id: 'demo-1',
    slug: 'demo-a-quiet-morning',
    title: 'A Quiet Morning',
    description: demoNote,
    categoryId: 'demo-cinematic',
    thumbnail: '/demo/quiet-morning.svg',
    videoUrl: demoVideo,
    clientName: 'Personal study',
    year: '2024',
    duration: '0:32',
    role: 'Editor',
    featured: true,
    published: true,
    sortOrder: 1,
  },
  {
    id: 'demo-2',
    slug: 'demo-small-moments',
    title: 'Small Moments',
    description: demoNote,
    categoryId: 'demo-reels',
    thumbnail: '/demo/small-moments.svg',
    videoUrl: demoVideo,
    clientName: 'Personal study',
    year: '2024',
    duration: '0:18',
    role: 'Editor',
    featured: true,
    published: true,
    sortOrder: 2,
  },
  {
    id: 'demo-3',
    slug: 'demo-light-in-bloom',
    title: 'Light in Bloom',
    description: demoNote,
    categoryId: 'demo-docs',
    thumbnail: '/demo/light-in-bloom.svg',
    videoUrl: demoVideo,
    clientName: 'Personal study',
    year: '2024',
    duration: '0:45',
    role: 'Editor',
    featured: false,
    published: true,
    sortOrder: 3,
  },
];

export const demoOfferings: Offering[] = [
  { id: 'off-1', title: 'Short-form & social', description: 'Reels, shorts, and creator cuts with pacing that holds attention.', published: true, sortOrder: 1 },
  { id: 'off-2', title: 'Documentary editing', description: 'Longer stories shaped with patience, structure, and emotional clarity.', published: true, sortOrder: 2 },
  { id: 'off-3', title: 'Real estate films', description: 'Spaces that feel lived-in — light, movement, and a sense of place.', published: true, sortOrder: 3 },
  { id: 'off-4', title: 'Commercial & promo', description: 'Brand films and promos with a clean finish and a memorable beat.', published: true, sortOrder: 4 },
  { id: 'off-5', title: 'Cinematic storytelling', description: 'Narrative edits that treat every look, breath, and cut as part of the story.', published: true, sortOrder: 5 },
  { id: 'off-6', title: 'YouTube & creator edits', description: 'Channel-ready videos with rhythm, retention, and a finish that matches your voice.', published: true, sortOrder: 6 },
];

export const demoTestimonials: Testimonial[] = [
  {
    id: 't-1',
    quote: 'Saurav finds the feeling in the footage. The cut was tighter, warmer, and more like us than we expected.',
    author: 'Alex Morgan',
    role: 'Independent filmmaker',
    published: true,
    sortOrder: 1,
  },
  {
    id: 't-2',
    quote: 'Clear communication, thoughtful pacing, and a final delivery that needed almost nothing back.',
    author: 'Priya Shah',
    role: 'Brand producer',
    published: true,
    sortOrder: 2,
  },
  {
    id: 't-3',
    quote: 'He treated a simple real-estate walkthrough like a short film. That care shows.',
    author: 'James Okonkwo',
    role: 'Studio lead',
    published: true,
    sortOrder: 3,
  },
];

export const leadStatusCopy: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  quoted: 'Quoted',
  booked: 'Booked',
  closed: 'Closed',
};

export function parseProfile(value: string | null | undefined): SiteProfile {
  if (!value) return defaultProfile;
  try {
    const parsed = JSON.parse(value) as Partial<SiteProfile>;
    return {
      ...defaultProfile,
      ...parsed,
      aboutParagraphs: parsed.aboutParagraphs?.length ? parsed.aboutParagraphs : defaultProfile.aboutParagraphs,
      tools: parsed.tools?.length ? parsed.tools : defaultProfile.tools,
      process: parsed.process?.length ? parsed.process : defaultProfile.process,
    };
  } catch {
    return defaultProfile;
  }
}
