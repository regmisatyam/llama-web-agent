export interface TemplateFile {
  name: string;
  language: 'html' | 'css' | 'js';
  content: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  pages: number;
  gradient: string;
  accentColor: string;
  files: TemplateFile[];
}

// ─── Template 1: SaaS Landing ────────────────────────────────────────────────
const saasIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Acme — the platform that helps teams ship faster">
  <title>Acme — Modern SaaS Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 antialiased">
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-bold text-indigo-600">Acme</span>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="index.html" class="text-indigo-600">Home</a>
        <a href="pricing.html" class="hover:text-gray-900 transition-colors">Pricing</a>
        <a href="#features" class="hover:text-gray-900 transition-colors">Features</a>
        <a href="pricing.html" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Get Started</a>
      </div>
    </div>
  </nav>
  <section class="py-24 px-6 bg-gradient-to-b from-indigo-50 to-white text-center">
    <div class="max-w-4xl mx-auto">
      <span class="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-6">Now in public beta</span>
      <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">Ship faster with<br/><span class="text-indigo-600">AI-powered workflows</span></h1>
      <p class="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">Acme connects your team, automates repetitive tasks, and gives you the insights you need to build better products faster.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="pricing.html" class="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">Start free trial</a>
        <a href="#features" class="px-8 py-4 border border-gray-200 rounded-xl font-semibold hover:border-gray-300 transition-colors">See how it works</a>
      </div>
    </div>
  </section>
  <section id="features" class="py-20 px-6">
    <div class="max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center mb-4">Everything your team needs</h2>
      <p class="text-gray-500 text-center mb-16 max-w-xl mx-auto">From planning to shipping, Acme covers every step of your workflow.</p>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
          <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-3">Automated workflows</h3>
          <p class="text-gray-500 text-sm leading-relaxed">Set up powerful automations that handle repetitive tasks so your team can focus on what matters most.</p>
        </div>
        <div class="p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
          <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-3">Real-time analytics</h3>
          <p class="text-gray-500 text-sm leading-relaxed">Get a live view of your key metrics and understand what's driving growth across your product.</p>
        </div>
        <div class="p-8 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all">
          <div class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          </div>
          <h3 class="text-lg font-semibold mb-3">Team collaboration</h3>
          <p class="text-gray-500 text-sm leading-relaxed">Invite your entire team, assign roles, and work together in real time with full version history.</p>
        </div>
      </div>
    </div>
  </section>
  <section class="py-20 px-6 bg-indigo-600 text-white text-center">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-3xl font-bold mb-4">Ready to get started?</h2>
      <p class="text-indigo-200 mb-8">Join thousands of teams already using Acme to ship faster.</p>
      <a href="pricing.html" class="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">View pricing</a>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
    <p>&copy; 2025 Acme Inc. All rights reserved.</p>
  </footer>
</body>
</html>`;

const saasPricing = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing — Acme</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 antialiased">
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-bold text-indigo-600">Acme</span>
      <div class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="index.html" class="hover:text-gray-900 transition-colors">Home</a>
        <a href="pricing.html" class="text-indigo-600">Pricing</a>
        <a href="#faq" class="hover:text-gray-900 transition-colors">FAQ</a>
        <a href="#" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Get Started</a>
      </div>
    </div>
  </nav>
  <section class="py-20 px-6 text-center">
    <h1 class="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
    <p class="text-gray-500 mb-16 max-w-lg mx-auto">Start for free, upgrade when you are ready. No hidden fees.</p>
    <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
      <div class="p-8 rounded-2xl border border-gray-200">
        <h3 class="text-lg font-semibold mb-2">Starter</h3>
        <div class="text-4xl font-bold mb-1">$0</div>
        <p class="text-gray-500 text-sm mb-8">per month, forever free</p>
        <ul class="space-y-3 text-sm text-gray-600 mb-8">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Up to 3 projects</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>1 team member</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Basic analytics</li>
        </ul>
        <a href="#" class="block text-center py-3 border border-gray-200 rounded-xl font-medium hover:border-indigo-300 transition-colors">Get started free</a>
      </div>
      <div class="p-8 rounded-2xl border-2 border-indigo-600 relative">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium">Most popular</span>
        <h3 class="text-lg font-semibold mb-2">Pro</h3>
        <div class="text-4xl font-bold mb-1">$29</div>
        <p class="text-gray-500 text-sm mb-8">per month</p>
        <ul class="space-y-3 text-sm text-gray-600 mb-8">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Unlimited projects</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Up to 10 members</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Advanced analytics</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>AI workflows</li>
        </ul>
        <a href="#" class="block text-center py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">Get started</a>
      </div>
      <div class="p-8 rounded-2xl border border-gray-200">
        <h3 class="text-lg font-semibold mb-2">Enterprise</h3>
        <div class="text-4xl font-bold mb-1">Custom</div>
        <p class="text-gray-500 text-sm mb-8">contact us for pricing</p>
        <ul class="space-y-3 text-sm text-gray-600 mb-8">
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Unlimited everything</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>Dedicated support</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>SSO &amp; SAML</li>
          <li class="flex items-center gap-2"><svg class="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>SLA guarantee</li>
        </ul>
        <a href="mailto:sales@acme.com" class="block text-center py-3 border border-gray-200 rounded-xl font-medium hover:border-indigo-300 transition-colors">Contact sales</a>
      </div>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
    <p>&copy; 2025 Acme Inc. All rights reserved.</p>
  </footer>
</body>
</html>`;

// ─── Template 2: Portfolio ────────────────────────────────────────────────────
const portfolioIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alex Chen — Product Designer</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="font-bold text-lg">Alex Chen</span>
      <div class="flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="text-white">Home</a>
        <a href="work.html" class="hover:text-white transition-colors">Work</a>
        <a href="contact.html" class="hover:text-white transition-colors">Contact</a>
      </div>
    </div>
  </nav>
  <section class="min-h-[88vh] flex flex-col justify-center max-w-5xl mx-auto px-6 py-20">
    <p class="text-indigo-400 font-medium mb-4">Hello, I am Alex</p>
    <h1 class="text-5xl md:text-7xl font-black leading-tight mb-6">Product Designer<br/><span class="text-gray-500">and Visual Creator</span></h1>
    <p class="text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">I design thoughtful digital experiences that balance aesthetics with usability. Currently open for new projects.</p>
    <div class="flex gap-4">
      <a href="work.html" class="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">View my work</a>
      <a href="contact.html" class="px-6 py-3 border border-gray-700 rounded-xl font-semibold hover:border-gray-500 transition-colors">Get in touch</a>
    </div>
  </section>
  <section class="py-20 px-6 border-t border-gray-800">
    <div class="max-w-5xl mx-auto">
      <h2 class="text-2xl font-bold mb-12 text-gray-300">Selected Work</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <a href="work.html" class="block rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-8 h-64 hover:scale-[1.02] transition-transform cursor-pointer">
          <span class="text-xs font-medium text-indigo-200 uppercase tracking-wider">Product Design</span>
          <h3 class="text-2xl font-bold mt-2 mb-2">Fintech Dashboard</h3>
          <p class="text-indigo-200 text-sm">Complete redesign of a complex analytics platform</p>
        </a>
        <a href="work.html" class="block rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 p-8 h-64 hover:scale-[1.02] transition-transform cursor-pointer">
          <span class="text-xs font-medium text-emerald-200 uppercase tracking-wider">Mobile App</span>
          <h3 class="text-2xl font-bold mt-2 mb-2">Wellness Tracker</h3>
          <p class="text-emerald-200 text-sm">iOS app with 50K+ monthly active users</p>
        </a>
      </div>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 max-w-5xl mx-auto flex justify-between items-center text-sm text-gray-500">
    <span>&copy; 2025 Alex Chen</span>
    <div class="flex gap-6">
      <a href="#" class="hover:text-white transition-colors">Dribbble</a>
      <a href="#" class="hover:text-white transition-colors">LinkedIn</a>
    </div>
  </footer>
</body>
</html>`;

const portfolioWork = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Work — Alex Chen</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="font-bold text-lg">Alex Chen</span>
      <div class="flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="hover:text-white transition-colors">Home</a>
        <a href="work.html" class="text-white">Work</a>
        <a href="contact.html" class="hover:text-white transition-colors">Contact</a>
      </div>
    </div>
  </nav>
  <section class="max-w-5xl mx-auto px-6 py-20">
    <h1 class="text-4xl font-black mb-4">All Projects</h1>
    <p class="text-gray-400 mb-16">A selection of my best design work across product, mobile, and brand.</p>
    <div class="grid md:grid-cols-2 gap-8">
      <div class="rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <div class="h-48 bg-gradient-to-br from-indigo-600 to-purple-700 flex items-end p-6">
          <span class="text-xs font-medium text-indigo-200 uppercase tracking-wider">Product Design</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">Fintech Dashboard</h3>
          <p class="text-gray-400 text-sm mb-4">Redesigned the core analytics platform for a fintech startup, reducing cognitive load by 40% through information hierarchy improvements.</p>
          <div class="flex gap-2">
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Figma</span>
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">User Research</span>
          </div>
        </div>
      </div>
      <div class="rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <div class="h-48 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-end p-6">
          <span class="text-xs font-medium text-emerald-200 uppercase tracking-wider">Mobile App</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">Wellness Tracker</h3>
          <p class="text-gray-400 text-sm mb-4">Designed an intuitive iOS wellness app from zero to 50K users. Focused on building habit-forming interaction patterns.</p>
          <div class="flex gap-2">
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">iOS</span>
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Prototyping</span>
          </div>
        </div>
      </div>
      <div class="rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <div class="h-48 bg-gradient-to-br from-rose-600 to-orange-500 flex items-end p-6">
          <span class="text-xs font-medium text-rose-200 uppercase tracking-wider">Brand Identity</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">Artisan Coffee Brand</h3>
          <p class="text-gray-400 text-sm mb-4">Full brand identity for a specialty coffee roaster — logo, packaging, and digital presence.</p>
          <div class="flex gap-2">
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Branding</span>
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Packaging</span>
          </div>
        </div>
      </div>
      <div class="rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <div class="h-48 bg-gradient-to-br from-blue-600 to-cyan-500 flex items-end p-6">
          <span class="text-xs font-medium text-blue-200 uppercase tracking-wider">Web Design</span>
        </div>
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">E-commerce Redesign</h3>
          <p class="text-gray-400 text-sm mb-4">Conversion-focused redesign for a fashion brand, resulting in 28% increase in checkout completion.</p>
          <div class="flex gap-2">
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">E-commerce</span>
            <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">A/B Testing</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 max-w-5xl mx-auto flex justify-between items-center text-sm text-gray-500">
    <span>&copy; 2025 Alex Chen</span>
    <a href="contact.html" class="text-indigo-400 hover:text-indigo-300">Let's work together &rarr;</a>
  </footer>
</body>
</html>`;

const portfolioContact = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — Alex Chen</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="font-bold text-lg">Alex Chen</span>
      <div class="flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="hover:text-white transition-colors">Home</a>
        <a href="work.html" class="hover:text-white transition-colors">Work</a>
        <a href="contact.html" class="text-white">Contact</a>
      </div>
    </div>
  </nav>
  <section class="max-w-2xl mx-auto px-6 py-24">
    <h1 class="text-4xl font-black mb-4">Let's talk</h1>
    <p class="text-gray-400 mb-12">Have a project in mind? I'd love to hear about it. Send me a message and I'll get back within 24 hours.</p>
    <form class="space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Name</label>
          <input type="text" placeholder="Your name" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"/>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input type="email" placeholder="your@email.com" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"/>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Project type</label>
        <select class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors">
          <option>Product Design</option>
          <option>Mobile App</option>
          <option>Brand Identity</option>
          <option>Web Design</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Message</label>
        <textarea rows="5" placeholder="Tell me about your project..." class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"></textarea>
      </div>
      <button type="submit" class="w-full py-4 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">Send message</button>
    </form>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 max-w-5xl mx-auto text-center text-sm text-gray-500">
    <p>&copy; 2025 Alex Chen</p>
  </footer>
</body>
</html>`;

// ─── Template 3: Restaurant ───────────────────────────────────────────────────
const restaurantIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ember Kitchen — Modern Mediterranean</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-stone-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-stone-950/90 backdrop-blur border-b border-stone-800">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-bold text-amber-400">Ember Kitchen</span>
      <div class="hidden md:flex items-center gap-8 text-sm text-stone-300">
        <a href="index.html" class="text-amber-400">Home</a>
        <a href="menu.html" class="hover:text-white transition-colors">Menu</a>
        <a href="#reservations" class="hover:text-white transition-colors">Reservations</a>
        <a href="#reservations" class="px-4 py-2 bg-amber-500 text-stone-950 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Book a Table</a>
      </div>
    </div>
  </nav>
  <section class="relative min-h-[90vh] flex items-center justify-center text-center px-6" style="background: linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1400') center/cover no-repeat;">
    <div class="max-w-3xl">
      <p class="text-amber-400 font-medium tracking-widest uppercase text-sm mb-4">Mediterranean Cuisine</p>
      <h1 class="text-5xl md:text-7xl font-black mb-6 leading-tight">Where Fire Meets<br/>Flavor</h1>
      <p class="text-stone-300 text-xl mb-10 max-w-xl mx-auto">Wood-fired cooking and seasonal ingredients in the heart of the city. An experience that nourishes body and soul.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#reservations" class="px-8 py-4 bg-amber-500 text-stone-950 rounded-xl font-bold hover:bg-amber-400 transition-colors">Reserve a Table</a>
        <a href="menu.html" class="px-8 py-4 border border-white/30 rounded-xl font-semibold hover:border-white transition-colors">View Menu</a>
      </div>
    </div>
  </section>
  <section class="py-20 px-6 bg-stone-900">
    <div class="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
      <div class="p-6">
        <div class="text-3xl mb-3">&#127859;</div>
        <h3 class="text-lg font-bold mb-2 text-amber-400">Wood-Fired Oven</h3>
        <p class="text-stone-400 text-sm">Every dish touched by 700°F flames for that unmistakable char and depth of flavor.</p>
      </div>
      <div class="p-6">
        <div class="text-3xl mb-3">&#127807;</div>
        <h3 class="text-lg font-bold mb-2 text-amber-400">Seasonal Ingredients</h3>
        <p class="text-stone-400 text-sm">Menu changes with the seasons. We source from local farms within 50 miles of the city.</p>
      </div>
      <div class="p-6">
        <div class="text-3xl mb-3">&#127863;</div>
        <h3 class="text-lg font-bold mb-2 text-amber-400">Natural Wine List</h3>
        <p class="text-stone-400 text-sm">Curated selection of natural and biodynamic wines from small producers worldwide.</p>
      </div>
    </div>
  </section>
  <section id="reservations" class="py-20 px-6 bg-stone-950">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-3xl font-bold mb-4">Make a Reservation</h2>
      <p class="text-stone-400 mb-10">We accept reservations up to 30 days in advance. Walk-ins welcome for bar seating.</p>
      <form class="grid md:grid-cols-2 gap-4">
        <input type="text" placeholder="Your name" class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"/>
        <input type="tel" placeholder="Phone number" class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"/>
        <input type="date" class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"/>
        <select class="bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
          <option>2 guests</option><option>3 guests</option><option>4 guests</option><option>5+ guests</option>
        </select>
        <button type="submit" class="md:col-span-2 py-4 bg-amber-500 text-stone-950 rounded-xl font-bold hover:bg-amber-400 transition-colors">Confirm Reservation</button>
      </form>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-stone-800 text-center text-sm text-stone-500">
    <p class="mb-2">123 Flame Street, Downtown &bull; Open Tue-Sun 5pm-11pm</p>
    <p>&copy; 2025 Ember Kitchen. All rights reserved.</p>
  </footer>
</body>
</html>`;

const restaurantMenu = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu — Ember Kitchen</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-stone-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-stone-950/90 backdrop-blur border-b border-stone-800">
    <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-bold text-amber-400">Ember Kitchen</span>
      <div class="hidden md:flex items-center gap-8 text-sm text-stone-300">
        <a href="index.html" class="hover:text-white transition-colors">Home</a>
        <a href="menu.html" class="text-amber-400">Menu</a>
        <a href="index.html#reservations" class="px-4 py-2 bg-amber-500 text-stone-950 rounded-lg font-semibold hover:bg-amber-400 transition-colors">Book a Table</a>
      </div>
    </div>
  </nav>
  <section class="max-w-4xl mx-auto px-6 py-20">
    <h1 class="text-4xl font-black mb-2 text-center">Our Menu</h1>
    <p class="text-stone-400 text-center mb-16">Seasonal menu — changes monthly. All dishes are gluten-free adaptable upon request.</p>
    <div class="space-y-16">
      <div>
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-8 border-b border-stone-800 pb-4">To Start</h2>
        <div class="space-y-6">
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Wood-Roasted Burrata</h3><p class="text-stone-400 text-sm">Heirloom tomatoes, aged balsamic, fresh basil, grilled sourdough</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$18</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Charred Octopus</h3><p class="text-stone-400 text-sm">Smoked paprika aioli, pickled celery, micro herbs</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$24</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Ember Flatbread</h3><p class="text-stone-400 text-sm">Labneh, za'atar, olive oil, spring onion, chili flakes</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$16</span>
          </div>
        </div>
      </div>
      <div>
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-8 border-b border-stone-800 pb-4">Mains</h2>
        <div class="space-y-6">
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Wood-Fired Lamb Chops</h3><p class="text-stone-400 text-sm">Harissa, preserved lemon, pomegranate, couscous tabbouleh</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$48</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Whole Roasted Sea Bass</h3><p class="text-stone-400 text-sm">Fennel, citrus, capers, roasted cherry tomatoes, olive oil</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$44</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Wild Mushroom Risotto</h3><p class="text-stone-400 text-sm">Porcini, truffle oil, aged parmesan, fresh thyme <span class="text-xs bg-green-900 text-green-400 px-1 rounded">V</span></p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$32</span>
          </div>
        </div>
      </div>
      <div>
        <h2 class="text-xs font-bold uppercase tracking-widest text-amber-400 mb-8 border-b border-stone-800 pb-4">Desserts</h2>
        <div class="space-y-6">
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Burnt Honey Panna Cotta</h3><p class="text-stone-400 text-sm">Seasonal berries, candied pistachios, honeycomb</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$14</span>
          </div>
          <div class="flex justify-between items-start gap-4">
            <div><h3 class="font-semibold mb-1">Chocolate Lava Cake</h3><p class="text-stone-400 text-sm">Tahini ice cream, sea salt, espresso caramel</p></div>
            <span class="text-amber-400 font-semibold flex-shrink-0">$16</span>
          </div>
        </div>
      </div>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-stone-800 text-center text-sm text-stone-500">
    <p>&copy; 2025 Ember Kitchen. Menu subject to seasonal change.</p>
  </footer>
</body>
</html>`;

// ─── Template 4: Blog ─────────────────────────────────────────────────────────
const blogIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Long Game — A Blog</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 antialiased">
  <nav class="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="index.html" class="text-xl font-black tracking-tight">The Long Game</a>
      <div class="flex items-center gap-8 text-sm text-gray-500">
        <a href="index.html" class="text-gray-900 font-medium">Home</a>
        <a href="post.html" class="hover:text-gray-900 transition-colors">Articles</a>
        <a href="#" class="hover:text-gray-900 transition-colors">About</a>
        <a href="#newsletter" class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium">Subscribe</a>
      </div>
    </div>
  </nav>
  <section class="max-w-4xl mx-auto px-6 py-16">
    <div class="mb-16 pb-16 border-b border-gray-100">
      <a href="post.html">
        <span class="text-xs font-medium text-blue-600 uppercase tracking-wider">Featured</span>
        <h2 class="text-4xl font-black mt-2 mb-4 leading-tight hover:text-gray-600 transition-colors">The Quiet Revolution in How We Think About Productivity</h2>
        <p class="text-gray-500 text-lg leading-relaxed mb-6">Somewhere between the obsessive optimization culture and the slow living movement, a more nuanced understanding of human performance is quietly taking hold.</p>
        <div class="flex items-center gap-4 text-sm text-gray-400">
          <span>Marcus Webb</span>
          <span>&bull;</span>
          <span>April 18, 2025</span>
          <span>&bull;</span>
          <span>8 min read</span>
        </div>
      </a>
    </div>
    <div class="grid md:grid-cols-2 gap-10">
      <a href="post.html" class="group">
        <div class="h-48 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-200 mb-4"></div>
        <span class="text-xs font-medium text-blue-600 uppercase tracking-wider">Technology</span>
        <h3 class="text-xl font-bold mt-1 mb-2 group-hover:text-gray-500 transition-colors">Why Your Second Brain Needs a Third Brain</h3>
        <p class="text-gray-500 text-sm mb-3 leading-relaxed">Note-taking apps promised to remember everything. Now we need AI to make sense of what we remembered.</p>
        <span class="text-xs text-gray-400">March 28, 2025 &bull; 6 min read</span>
      </a>
      <a href="post.html" class="group">
        <div class="h-48 rounded-2xl bg-gradient-to-br from-rose-100 to-orange-200 mb-4"></div>
        <span class="text-xs font-medium text-rose-600 uppercase tracking-wider">Mindset</span>
        <h3 class="text-xl font-bold mt-1 mb-2 group-hover:text-gray-500 transition-colors">On Boredom and the Creative Mind</h3>
        <p class="text-gray-500 text-sm mb-3 leading-relaxed">We have engineered boredom out of existence. Here is why that might be the most expensive thing we have ever done.</p>
        <span class="text-xs text-gray-400">March 10, 2025 &bull; 5 min read</span>
      </a>
    </div>
  </section>
  <section id="newsletter" class="py-16 px-6 bg-gray-900 text-white text-center">
    <div class="max-w-xl mx-auto">
      <h2 class="text-2xl font-bold mb-3">Get the weekly digest</h2>
      <p class="text-gray-400 mb-8">One email every Friday. Ideas on work, creativity, and the examined life.</p>
      <form class="flex gap-3 max-w-md mx-auto">
        <input type="email" placeholder="your@email.com" class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"/>
        <button type="submit" class="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex-shrink-0">Subscribe</button>
      </form>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
    <p>&copy; 2025 The Long Game. All rights reserved.</p>
  </footer>
</body>
</html>`;

const blogPost = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Quiet Revolution in Productivity — The Long Game</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 antialiased">
  <nav class="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
    <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="index.html" class="text-xl font-black tracking-tight">The Long Game</a>
      <div class="flex items-center gap-8 text-sm text-gray-500">
        <a href="index.html" class="hover:text-gray-900 transition-colors">Home</a>
        <a href="post.html" class="text-gray-900 font-medium">Articles</a>
        <a href="#" class="hover:text-gray-900 transition-colors">About</a>
      </div>
    </div>
  </nav>
  <article class="max-w-2xl mx-auto px-6 py-16">
    <span class="text-xs font-medium text-blue-600 uppercase tracking-wider">Productivity</span>
    <h1 class="text-4xl md:text-5xl font-black mt-3 mb-6 leading-tight">The Quiet Revolution in How We Think About Productivity</h1>
    <div class="flex items-center gap-4 text-sm text-gray-400 mb-12 pb-8 border-b border-gray-100">
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0"></div>
      <span class="font-medium text-gray-700">Marcus Webb</span>
      <span>&bull;</span>
      <span>April 18, 2025</span>
      <span>&bull;</span>
      <span>8 min read</span>
    </div>
    <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
      <p class="text-xl text-gray-600 leading-relaxed">Somewhere between the obsessive optimization culture and the slow living movement, a more nuanced understanding of human performance is quietly taking hold.</p>
      <p>For the better part of a decade, productivity advice has oscillated between two poles. On one end, the quantified-self crowd: track everything, optimize everything, squeeze every drop of output from every waking hour. On the other, the backlash movement: burn your to-do list, take long walks, embrace the unscheduled afternoon.</p>
      <h2 class="text-2xl font-bold text-gray-900 mt-10">The False Dichotomy</h2>
      <p>The problem with both camps is that they treat human performance like a dial with two settings. High output or low output. On or off. But anyone who has done meaningful creative work knows it does not work that way. The best ideas rarely arrive during scheduled deep work blocks. The most focused sessions often follow periods of apparent idleness.</p>
      <p>What is emerging now — slowly, without fanfare — is a more sophisticated model. One that treats different kinds of cognitive activity as requiring different conditions, and that acknowledges the role of recovery, boredom, and apparently wasted time in the overall ecosystem of a productive mind.</p>
      <h2 class="text-2xl font-bold text-gray-900 mt-10">What the Research Actually Says</h2>
      <p>The science here is more interesting than most productivity writers acknowledge. Studies on incubation in creative problem-solving consistently show that periods of distraction — particularly mind-wandering — allow the default mode network to process problems in ways that focused attention cannot. You are not wasting time when you go for a walk after struggling with a problem. You are engaging a different cognitive system.</p>
      <blockquote class="border-l-4 border-blue-500 pl-6 italic text-gray-600 my-8">
        "The measure of intelligence is the ability to change." — Albert Einstein
      </blockquote>
      <p>This does not mean that focused work does not matter. It clearly does. But it means that the conditions for sustained, high-quality output include things that look nothing like output: sleep, play, conversation, movement, and yes, boredom.</p>
    </div>
    <div class="mt-16 pt-8 border-t border-gray-100 flex items-center gap-4">
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500"></div>
      <div>
        <p class="font-semibold">Marcus Webb</p>
        <p class="text-sm text-gray-500">Writing about work, creativity, and the examined life since 2019.</p>
      </div>
    </div>
  </article>
  <section class="py-16 px-6 bg-gray-50 text-center">
    <div class="max-w-xl mx-auto">
      <h2 class="text-2xl font-bold mb-3">Enjoyed this article?</h2>
      <p class="text-gray-500 mb-6">Subscribe to get new essays every week.</p>
      <form class="flex gap-3 max-w-md mx-auto">
        <input type="email" placeholder="your@email.com" class="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"/>
        <button type="submit" class="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors flex-shrink-0">Subscribe</button>
      </form>
    </div>
  </section>
  <footer class="py-10 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
    <p>&copy; 2025 The Long Game. <a href="index.html" class="hover:text-gray-600">Back to home</a></p>
  </footer>
</body>
</html>`;

// ─── Template 5: Agency ───────────────────────────────────────────────────────
const agencyIndex = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulse Studio — Creative Agency</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <span class="text-xl font-black tracking-tight"><span class="text-purple-400">Pulse</span> Studio</span>
      <div class="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="text-white">Work</a>
        <a href="services.html" class="hover:text-white transition-colors">Services</a>
        <a href="contact.html" class="hover:text-white transition-colors">Contact</a>
        <a href="contact.html" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Start a Project</a>
      </div>
    </div>
  </nav>
  <section class="max-w-7xl mx-auto px-6 py-24">
    <div class="max-w-4xl">
      <p class="text-purple-400 font-medium mb-4 text-sm uppercase tracking-widest">Creative Agency &bull; Est. 2019</p>
      <h1 class="text-6xl md:text-8xl font-black leading-none mb-8">We build<br/><span class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">brands</span><br/>that last.</h1>
      <p class="text-xl text-gray-400 max-w-xl mb-12 leading-relaxed">Strategy, design, and technology working together to create identities that resonate and experiences that convert.</p>
      <div class="flex gap-6 text-sm">
        <a href="contact.html" class="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">Start a project</a>
        <a href="services.html" class="px-8 py-4 border border-gray-700 rounded-xl font-semibold hover:border-gray-500 transition-colors">Our services</a>
      </div>
    </div>
  </section>
  <section class="py-10 px-6 border-y border-gray-800 bg-gray-900/40">
    <div class="max-w-7xl mx-auto flex flex-wrap gap-12 items-center justify-around text-gray-500 text-sm font-semibold uppercase tracking-wider">
      <span>Spotify</span><span>Airbnb</span><span>Figma</span><span>Linear</span><span>Vercel</span><span>Stripe</span>
    </div>
  </section>
  <section class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-end mb-16">
        <div>
          <h2 class="text-3xl font-black mb-2">Selected Work</h2>
          <p class="text-gray-500">Recent projects we are proud of</p>
        </div>
        <a href="services.html" class="text-sm text-purple-400 hover:text-purple-300 transition-colors">All services &rarr;</a>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-indigo-900 p-10 h-80 flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer">
          <span class="text-xs font-medium text-purple-300 uppercase tracking-wider">Brand Identity</span>
          <div>
            <h3 class="text-3xl font-black mb-2">Northstar Finance</h3>
            <p class="text-purple-300 text-sm">Complete rebrand for a Series B fintech startup</p>
          </div>
        </div>
        <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-rose-900 to-orange-900 p-10 h-80 flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer">
          <span class="text-xs font-medium text-rose-300 uppercase tracking-wider">Digital Product</span>
          <div>
            <h3 class="text-3xl font-black mb-2">Terrain App</h3>
            <p class="text-rose-300 text-sm">iOS app design and development for outdoor enthusiasts</p>
          </div>
        </div>
        <div class="rounded-2xl overflow-hidden bg-gradient-to-br from-teal-900 to-cyan-900 p-10 h-80 flex flex-col justify-between hover:scale-[1.01] transition-transform cursor-pointer">
          <span class="text-xs font-medium text-teal-300 uppercase tracking-wider">Web Experience</span>
          <div>
            <h3 class="text-3xl font-black mb-2">Meadow Studio</h3>
            <p class="text-teal-300 text-sm">Award-winning portfolio site for an architecture firm</p>
          </div>
        </div>
        <div class="rounded-2xl bg-gray-900 border border-gray-800 p-10 h-80 flex items-center justify-center hover:border-purple-800 transition-colors cursor-pointer">
          <div class="text-center">
            <p class="text-gray-500 text-sm mb-3">Your project could be here</p>
            <a href="contact.html" class="text-purple-400 font-semibold hover:text-purple-300 transition-colors">Start a conversation &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="py-20 px-6 bg-gradient-to-r from-purple-900 to-pink-900 text-center">
    <h2 class="text-4xl font-black mb-4">Ready to build something great?</h2>
    <p class="text-purple-200 mb-8 max-w-xl mx-auto">We take on a limited number of projects each quarter to ensure every client gets our full attention.</p>
    <a href="contact.html" class="inline-block px-8 py-4 bg-white text-purple-900 rounded-xl font-bold hover:bg-gray-100 transition-colors">Get in touch</a>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 text-center text-sm text-gray-500">
    <p>&copy; 2025 Pulse Studio. All rights reserved.</p>
  </footer>
</body>
</html>`;

const agencyServices = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Services — Pulse Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="index.html" class="text-xl font-black tracking-tight"><span class="text-purple-400">Pulse</span> Studio</a>
      <div class="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="hover:text-white transition-colors">Work</a>
        <a href="services.html" class="text-white">Services</a>
        <a href="contact.html" class="hover:text-white transition-colors">Contact</a>
        <a href="contact.html" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">Start a Project</a>
      </div>
    </div>
  </nav>
  <section class="max-w-5xl mx-auto px-6 py-24">
    <h1 class="text-5xl font-black mb-6">What we do</h1>
    <p class="text-xl text-gray-400 max-w-2xl mb-20 leading-relaxed">We are a full-service creative studio offering everything from brand strategy to product development. Here is how we can help.</p>
    <div class="space-y-8">
      <div class="p-8 rounded-2xl border border-gray-800 hover:border-purple-800 transition-colors">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-bold mb-3">Brand Identity</h3>
              <span class="text-purple-400 text-sm font-medium">From $8,000</span>
            </div>
            <p class="text-gray-400 leading-relaxed mb-4">Logo design, visual identity system, brand guidelines, typography, color palette, and all brand assets delivered in print and digital formats.</p>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Logo Design</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Brand Guidelines</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Visual Identity</span>
            </div>
          </div>
        </div>
      </div>
      <div class="p-8 rounded-2xl border border-gray-800 hover:border-purple-800 transition-colors">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 bg-pink-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2"/></svg>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-bold mb-3">Web Design &amp; Development</h3>
              <span class="text-pink-400 text-sm font-medium">From $15,000</span>
            </div>
            <p class="text-gray-400 leading-relaxed mb-4">Custom websites built for performance and conversion. Design, front-end development, CMS integration, and ongoing support included.</p>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">UI/UX Design</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Development</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">CMS</span>
            </div>
          </div>
        </div>
      </div>
      <div class="p-8 rounded-2xl border border-gray-800 hover:border-purple-800 transition-colors">
        <div class="flex items-start gap-6">
          <div class="w-12 h-12 bg-teal-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-start">
              <h3 class="text-xl font-bold mb-3">Product Design</h3>
              <span class="text-teal-400 text-sm font-medium">From $20,000</span>
            </div>
            <p class="text-gray-400 leading-relaxed mb-4">End-to-end product design for web and mobile applications. User research, wireframing, prototyping, and high-fidelity UI design.</p>
            <div class="flex flex-wrap gap-2">
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">User Research</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Prototyping</span>
              <span class="text-xs px-2 py-1 bg-gray-800 rounded-full text-gray-400">Design Systems</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="py-16 px-6 text-center border-t border-gray-800">
    <h2 class="text-3xl font-black mb-4">Not sure what you need?</h2>
    <p class="text-gray-400 mb-8">Book a free 30-minute discovery call and we will figure it out together.</p>
    <a href="contact.html" class="inline-block px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Book a call</a>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 text-center text-sm text-gray-500">
    <p>&copy; 2025 Pulse Studio. All rights reserved.</p>
  </footer>
</body>
</html>`;

const agencyContact = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact — Pulse Studio</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-white antialiased">
  <nav class="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <a href="index.html" class="text-xl font-black tracking-tight"><span class="text-purple-400">Pulse</span> Studio</a>
      <div class="hidden md:flex items-center gap-8 text-sm text-gray-400">
        <a href="index.html" class="hover:text-white transition-colors">Work</a>
        <a href="services.html" class="hover:text-white transition-colors">Services</a>
        <a href="contact.html" class="text-white">Contact</a>
      </div>
    </div>
  </nav>
  <section class="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16">
    <div>
      <h1 class="text-5xl font-black mb-6">Let's build something.</h1>
      <p class="text-gray-400 leading-relaxed mb-12">Tell us about your project and we will get back to you within one business day with our thoughts and a proposed next step.</p>
      <div class="space-y-6">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Email</p>
          <a href="mailto:hello@pulsestudio.co" class="text-purple-400 hover:text-purple-300">hello@pulsestudio.co</a>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Based in</p>
          <p class="text-white">New York, NY — Working worldwide</p>
        </div>
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Current availability</p>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-green-400 rounded-full"></span>
            <span class="text-white">Open for Q3 2025 projects</span>
          </div>
        </div>
      </div>
    </div>
    <form class="space-y-5">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Your name</label>
        <input type="text" placeholder="Jane Smith" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Email address</label>
        <input type="email" placeholder="jane@company.com" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Service interested in</label>
        <select class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors">
          <option>Brand Identity</option>
          <option>Web Design &amp; Development</option>
          <option>Product Design</option>
          <option>Not sure yet</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">Tell us about your project</label>
        <textarea rows="4" placeholder="What are you trying to build? What's the timeline? Any budget in mind?" class="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"></textarea>
      </div>
      <button type="submit" class="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">Send message</button>
    </form>
  </section>
  <footer class="py-10 px-6 border-t border-gray-800 text-center text-sm text-gray-500">
    <p>&copy; 2025 Pulse Studio. All rights reserved.</p>
  </footer>
</body>
</html>`;

// ─── Template Registry ────────────────────────────────────────────────────────
export const TEMPLATES: Template[] = [
  {
    id: 'saas',
    name: 'SaaS Landing',
    description: 'Modern product landing page with pricing tiers — perfect for apps and software products.',
    category: 'Business',
    pages: 2,
    gradient: 'from-indigo-500 to-purple-600',
    accentColor: 'indigo',
    files: [
      { name: 'index.html', language: 'html', content: saasIndex },
      { name: 'pricing.html', language: 'html', content: saasPricing },
    ],
  },
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Dark, minimal portfolio for designers and creatives with a project gallery and contact form.',
    category: 'Personal',
    pages: 3,
    gradient: 'from-gray-700 to-gray-900',
    accentColor: 'gray',
    files: [
      { name: 'index.html', language: 'html', content: portfolioIndex },
      { name: 'work.html', language: 'html', content: portfolioWork },
      { name: 'contact.html', language: 'html', content: portfolioContact },
    ],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Warm, atmospheric restaurant site with a full menu page and inline reservation form.',
    category: 'Hospitality',
    pages: 2,
    gradient: 'from-amber-600 to-orange-700',
    accentColor: 'amber',
    files: [
      { name: 'index.html', language: 'html', content: restaurantIndex },
      { name: 'menu.html', language: 'html', content: restaurantMenu },
    ],
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Clean editorial blog with post listing, featured articles, and newsletter signup.',
    category: 'Content',
    pages: 2,
    gradient: 'from-blue-500 to-cyan-500',
    accentColor: 'blue',
    files: [
      { name: 'index.html', language: 'html', content: blogIndex },
      { name: 'post.html', language: 'html', content: blogPost },
    ],
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    description: 'Bold, dark agency site with project showcase, services breakdown, and contact form.',
    category: 'Business',
    pages: 3,
    gradient: 'from-purple-600 to-pink-600',
    accentColor: 'purple',
    files: [
      { name: 'index.html', language: 'html', content: agencyIndex },
      { name: 'services.html', language: 'html', content: agencyServices },
      { name: 'contact.html', language: 'html', content: agencyContact },
    ],
  },
];
