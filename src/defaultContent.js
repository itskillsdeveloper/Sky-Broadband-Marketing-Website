// Fallback content — used when the billing API is unreachable, and as the shape
// reference. The billing app's /api/website/content returns the same structure.
export const defaultContent = {
  brand: { name: 'Sky Broadband', logoUrl: '' },
  theme: { accent: '#0EA5E9' },
  promo: {
    show: true,
    text: '🚀 Limited offer — Free installation + first month at 50% off on annual fiber plans.',
  },
  hero: {
    badge: 'NOW LIVE ACROSS RAIWIND & NEARBY AREAS',
    titleTop: "Raiwind's Fastest",
    titleHighlight: 'Fiber Broadband',
    subtitle:
      'Stream, game and work without limits on a pure fiber-optic network. Unlimited data, no FUP, 99.9% uptime and free installation — backed by 24/7 local support.',
    rating: '4.8',
    ratingCount: '1,500+',
  },
  stats: [
    { value: '99.9', suffix: '%', label: 'Network Uptime' },
    { value: '50', suffix: 'Mbps', label: 'Top Fiber Speed' },
    { value: '4500', suffix: '+', label: 'Happy Customers' },
    { value: '12', suffix: '+', label: 'Areas Covered' },
  ],
  plansIntro:
    'Unlimited data on every plan. All prices in PKR, billed monthly. Free installation included for a limited time.',
  plans: {
    wired: [
      { speed: 10, price: '2,000', popular: false },
      { speed: 15, price: '2,500', popular: false },
      { speed: 20, price: '3,000', popular: false },
      { speed: 25, price: '3,500', popular: true },
      { speed: 30, price: '4,000', popular: false },
      { speed: 40, price: '5,500', popular: false },
      { speed: 50, price: '6,500', popular: false },
    ],
    wireless: [
      { speed: 10, price: '4,000', popular: false },
      { speed: 15, price: '4,500', popular: false },
      { speed: 20, price: '5,000', popular: true },
      { speed: 25, price: '5,500', popular: false },
      { speed: 30, price: '6,500', popular: false },
    ],
  },
  features: [
    { title: 'Blazing Fiber Speed', text: 'Symmetric fiber-to-the-home delivers consistent speeds up to 50Mbps — even at peak hours.' },
    { title: '24/7 Local Support', text: 'Real humans right here in Raiwind, on call any time of day in English and Urdu — by phone, chat or WhatsApp.' },
    { title: 'No FUP, Truly Unlimited', text: 'Download as much as you want. We never throttle, cap or apply a Fair Usage Policy — ever.' },
    { title: 'Free Installation', text: 'Professional same-week fiber setup at no cost. Our certified engineers handle everything end-to-end.' },
    { title: 'Low Latency Gaming', text: 'Sub-5ms local ping and optimized routing for PUBG, Valorant, FIFA and lag-free 4K streaming.' },
    { title: 'Whole-Home Wi-Fi', text: 'Mesh-ready routers blanket every room in strong signal — no dead zones across your home or office.' },
  ],
  about: {
    title: 'A local ISP on a mission to connect Raiwind',
    text: "Born and based in Raiwind, Sky Broadband is the area's own dedicated fiber internet provider. We build and operate our own fiber-optic network so we can guarantee the speed, reliability and honest pricing that families and businesses deserve.",
    bullets: [
      '100% owned fiber network — no reselling, no middlemen, full control of your connection.',
      'Transparent PKR pricing — what you see is what you pay, no surprise charges.',
      'Local engineers in Raiwind — fast on-ground support, often same-day.',
    ],
    stats: [
      { value: '6+', label: 'Years serving Raiwind' },
      { value: '120km', label: 'Fiber laid locally' },
    ],
  },
  coverage: {
    areas: ['Raiwind City', 'Raiwind Road', 'Manga Mandi', 'Bhai Pheru', 'Hudiara', 'Lalyani', 'Adda Plot', 'Kacha Khoh', 'Kanganpur', 'Defence Road'],
  },
  testimonials: [
    { name: 'Ahmed Raza', area: 'Raiwind City, Lahore', quote: 'Switched from my old DSL and the difference is night and day. 4K Netflix on three TVs and zero buffering. Installation was free and done in two days.' },
    { name: 'Sana Malik', area: 'Raiwind Road, Lahore', quote: 'As a remote developer, low latency is everything. Sky Broadband gives me a rock-solid 4ms ping and my video calls never drop. Best ISP in Raiwind by far.' },
    { name: 'Bilal Khan', area: 'Manga Mandi, Lahore', quote: 'Truly unlimited with no FUP — exactly as promised. The support team answers on WhatsApp within minutes. We run our whole office on the Ultra plan.' },
  ],
  faqs: [
    { q: 'How fast is Sky Broadband fiber really?', a: 'Our fiber-to-the-home network delivers consistent symmetric speeds up to 50Mbps on wired plans, even during peak evening hours.' },
    { q: 'Is there really no FUP or data cap?', a: 'Correct. Every Sky Broadband plan is truly unlimited. We never apply a Fair Usage Policy, never throttle your connection, and never charge for extra data.' },
    { q: 'How much does installation cost?', a: 'Installation is completely free for a limited time on all plans, usually within 48 hours of sign-up.' },
    { q: 'Which areas do you cover?', a: 'We cover Raiwind town and the surrounding areas, and we are expanding street by street.' },
    { q: 'Can I upgrade or downgrade my plan later?', a: 'Absolutely. There are no lock-in contracts. The new speed applies from your next billing cycle.' },
    { q: 'What support do you offer if something goes wrong?', a: 'Our Raiwind-based support team is available 24/7 in English and Urdu by phone, live chat and WhatsApp.' },
  ],
  contact: {
    phone: '+92 42 111 759 759',
    phoneHref: '+924211175975',
    whatsapp: '+92 300 175 9759',
    whatsappHref: '923001759759',
    leadWhatsapp: '923001759759',
    email: 'hello@skybroadband.pk',
    address: 'Raiwind Road, Lahore, PK',
  },
  social: {
    facebook: 'https://facebook.com/skybroadband.pk',
    twitter: 'https://twitter.com/skybroadbandpk',
    instagram: 'https://instagram.com/skybroadband.pk',
    linkedin: 'https://linkedin.com/company/skybroadband-pk',
  },
  footer: {
    about: "Raiwind's own fiber broadband. Unlimited data, no FUP, 99.9% uptime — connecting homes and businesses across Raiwind.",
    copyright: '© 2026 Sky Broadband. All rights reserved.',
  },
};
