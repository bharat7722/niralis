export const site = {
  coupleShort: "H & N",
  groom: "Harsh",
  bride: "Nirali",
  tagline: "Forever Begins",
  hashtag: "#HarshWedsNirali",
  dateLabel: "11 February 2027",
  weekday: "Thursday",
  placeLabel: "Borsad, Gujarat",
  dateAndPlace: "11 February 2027 · Borsad, Gujarat",
  /** Local time the celebrations begin — drives the countdown. */
  weddingDate: "2027-02-11T00:00:00",
  venue: {
    name: "Sun Temple",
    city: "Borsad",
    state: "Gujarat",
    address: "Sun Temple, Borsad, Gujarat, India",
  },
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/our-story", label: "Our Story" },
  { href: "/details", label: "Details" },
  { href: "/gallery", label: "Gallery" },
  { href: "/rsvp", label: "Aagman Confirmation" },
  { href: "/guestbook", label: "Leave a Wish" },
] as const;

export const homeGallery = [
  { src: "/images/hero-mandap.jpg", alt: "Harsh and Nirali" },
  { src: "/images/couple-night-lights.jpg", alt: "Harsh and Nirali together" },
  { src: "/images/beach-hands.jpg", alt: "Harsh and Nirali engagement" },
  { src: "/images/beach-sunset.jpg", alt: "Harsh and Nirali at the beach" },
  { src: "/images/kurta-courtyard.jpg", alt: "Harsh and Nirali in traditional wear" },
  { src: "/images/villa-sunset.jpg", alt: "Harsh and Nirali on holiday" },
];

export const gallery = [
  { src: "/images/hero-mandap.jpg", alt: "Harsh and Nirali", caption: "Two hearts, one story" },
  { src: "/images/couple-night-lights.jpg", alt: "Harsh and Nirali together", caption: "Together is our favourite place" },
  { src: "/images/beach-hands.jpg", alt: "Harsh and Nirali engagement", caption: "The beginning of forever" },
  { src: "/images/beach-sunset.jpg", alt: "Harsh and Nirali at the beach", caption: "Our beautiful journey" },
  { src: "/images/kurta-courtyard.jpg", alt: "Harsh and Nirali in traditional wear", caption: "Forever & always" },
  { src: "/images/villa-sunset.jpg", alt: "Harsh and Nirali on holiday", caption: "Chasing sunsets together" },
  { src: "/images/courtyard-portrait.jpg", alt: "Harsh and Nirali portrait", caption: "A moment to remember" },
  { src: "/images/courtyard-embrace.jpg", alt: "Harsh and Nirali embracing", caption: "Making memories" },
  { src: "/images/rooftop-sunset.jpg", alt: "Harsh and Nirali on a rooftop", caption: "Our favourite moments" },
  { src: "/images/cafe-evening.jpg", alt: "Harsh and Nirali at a cafe", caption: "Where it all began" },
];

/**
 * `focus` is the object-position used when a photo is cropped into a wide
 * frame. Most of these are ordinary portraits and want the upper third.
 * beach-hands.jpg is the exception: it is two photographs stacked in one
 * file, so its crop has to sit wholly inside the lower one or the seam
 * between them shows.
 */
export const storyChapters = [
  {
    kicker: "Our Beginning",
    title: "Where It All Started",
    body: "Two hearts met, and an ordinary moment slowly became the beginning of our beautiful story.",
    image: "/images/cafe-evening.jpg",
    focus: "50% 30%",
  },
  {
    kicker: "The Journey",
    title: "Growing Together",
    body: "Through countless memories, laughter, conversations and dreams, Harsh and Nirali grew closer.",
    image: "/images/rooftop-sunset.jpg",
    focus: "50% 30%",
  },
  {
    kicker: "The Promise",
    title: "A Forever Promise",
    body: "Two families, two hearts and one beautiful promise to walk through life together.",
    image: "/images/beach-hands.jpg",
    focus: "50% 58%",
  },
  {
    kicker: "2027",
    title: "Forever Begins",
    body: "And now, surrounded by the people we love most, we begin our forever.",
    image: "/images/hero-mandap.jpg",
    focus: "50% 30%",
  },
];

/** India has no DST, so a fixed offset is safe for calendar export. */
export const IST_OFFSET_MINUTES = 330;

/**
 * How long each calendar entry runs. The site only publishes start times, so
 * this is a placeholder — set real durations here when they are known.
 */
export const DEFAULT_EVENT_MINUTES = 90;

export const schedule = [
  {
    date: "10 February 2027",
    events: [
      {
        name: "Ganesh Pooja",
        start: "2027-02-10T09:00",
        time: "9:00 AM",
        description: "Beginning our wedding celebrations with the blessings of Lord Ganesha.",
      },
      {
        name: "Mandap Muhurt",
        start: "2027-02-10T10:30",
        time: "10:30 AM",
        description: "A sacred ceremony marking the beginning of our wedding preparations.",
      },
      {
        name: "Haldi Carnival",
        start: "2027-02-10T14:00",
        time: "2:00 PM",
        description: "A colourful afternoon filled with haldi, flowers, laughter and beautiful memories.",
      },
      {
        name: "Dinner",
        start: "2027-02-10T18:30",
        time: "6:30 PM",
        description: "An evening of delicious food and togetherness with our loved ones.",
      },
      {
        name: "Garba Festival",
        start: "2027-02-10T20:30",
        time: "8:30 PM",
        description: "Let the music begin! Join us for a vibrant night of Garba, dance and celebration.",
      },
    ],
  },
  {
    date: "11 February 2027",
    events: [
      {
        name: "Baarat",
        start: "2027-02-11T09:00",
        time: "9:00 AM",
        description: "The groom's grand arrival as we begin the most-awaited day of our celebration.",
      },
      {
        name: "Grand Jaymala",
        start: "2027-02-11T11:30",
        time: "11:30 AM",
        description: "The beautiful moment when Harsh and Nirali exchange their garlands.",
      },
      {
        name: "Hast Melap & Fera",
        start: "2027-02-11T12:00",
        time: "12:00 PM",
        description: "The sacred wedding ceremony where two hearts become one, surrounded by blessings and love.",
      },
    ],
  },
];

export const dressCode = [
  { event: "Haldi", attire: "Yellow, floral & festive" },
  { event: "Garba Festival", attire: "Traditional Gujarati / colourful festivewear" },
  { event: "Wedding", attire: "Traditional Indian elegance" },
];

export const faqs = [
  {
    q: "Can I bring a plus-one?",
    a: "Please RSVP with the number of guests mentioned on your invitation. For special requests, please contact us.",
  },
  {
    q: "What should I wear?",
    a: "Please follow the dress-code information above. Traditional Indian festivewear is always welcome.",
  },
  {
    q: "Where is the wedding?",
    a: "Our wedding celebrations will take place at Sun Temple, Borsad, Gujarat.",
  },
  {
    q: "Can I share photos?",
    a: "Absolutely! Please use our wedding hashtag #HarshWedsNirali when sharing your favourite memories.",
  },
  {
    q: "What time should I arrive?",
    a: "Please check the event schedule for the specific ceremony you are attending.",
  },
];

export const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  site.venue.address,
)}`;
