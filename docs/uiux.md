# Aficionado UI/UX Guidelines

## Platform Premise
Aficionado is a premium social media platform designed to connect creators and their fans through immersive, short-form video streaming and direct engagement. To ensure a brand-safe, high-quality environment, Aficionado leverages proprietary, state-of-the-art anti-porn technology for automated content moderation. The anti-porn tech operates as an invisible shield in the background, allowing the user experience to remain focused entirely on entertainment, community, and creator monetization.

## Core UX Principles

1. **Content is King:** 
   The interface should recede into the background. The creator's video content must always be the focal point. UI elements overlaid on videos should be minimal, utilizing translucency to maintain immersion.

2. **Frictionless Discovery & Engagement:** 
   Browsing short-form videos should be intuitive, fluid, and addictive. Interactions like tipping, commenting, and subscribing must be just a tap away, minimizing the steps to convert a viewer into a supporter.

3. **Invisible Moderation, Transparent Appeals:** 
   The robust anti-porn moderation happens server-side. Fans never see moderation tools. If a creator's content is flagged, the UX should be clear, non-judgmental, and offer a straightforward appeals process without locking them out of their account unexpectedly.

4. **Premium Creator Experience:** 
   The Creator Studio should feel like a professional suite. Analytics, upload tools, and monetization dashboards must be data-rich but cleanly organized.

## Key User Journeys

### 1. The Fan Feed (Discovery & Viewing)
- **Goal:** Keep users engaged in a continuous stream of high-quality short video content.
- **Elements:**
  - **Full-Screen Player:** Edge-to-edge video playback. 
  - **Floating Controls:** Glassmorphic, floating sidebars or bottom sheets for engagement (Like, Comment, Share, Tip, Subscribe).
  - **Seamless Swiping:** Physics-based vertical swiping to seamlessly transition between videos.

### 2. The Creator Studio
- **Goal:** Empower creators to upload, stream, and manage their business.
- **Elements:**
  - **Quick Upload/Go Live:** Prominent action buttons for content creation.
  - **Analytics Dashboard:** Visualizing views, engagement, and revenue using elegant charts.
  - **Moderation Inbox:** A private area where creators are notified if a video is flagged by the anti-porn tech, with clear steps for resolution or appeal.

### 3. Monetization & Support
- **Goal:** Make supporting creators feel rewarding and frictionless.
- **Elements:**
  - One-tap micro-transactions (tips/gifts) using the gold/amber accent colors to denote value.
  - Exclusive "VIP" badges or glowing UI borders for subscribed fans in the comments section.

## Visual & Interaction Design 
*(Refer to `styling.md` for technical Tailwind/CSS implementation details)*

- **Aesthetic Vibe (Liquid Glass):** Cinematic, immersive, and premium. Dark themes (charcoal/zinc) act as a movie theater environment, reducing eye strain and allowing the vibrant colors of the video content to pop.
- **Translucency (Glassmorphism):** Essential for the short-video format. UI panels (like comment sections or creator bios) slide up over the video using a heavy `backdrop-blur`. This ensures the UI feels connected to the content rather than completely obscuring it.
- **Accents (Gold/Amber):** Reserved for high-value interactions. Actions like "Subscribe", "Tip", or "Go Live" use these warm accents to stand out against the dark UI, conveying a sense of premium exclusivity.
- **Micro-interactions:** Swipes, taps, and page transitions must be butter-smooth (60fps+). Double-tapping to like should trigger satisfying, subtle animations. 

## Accessibility & Responsiveness
- **Mobile-First Gestures:** The platform is built around mobile consumption. Navigation relies heavily on intuitive gestures (swipe up to skip, swipe right for creator profile, pull down to refresh).
- **Legibility Over Video:** Since text (like captions or usernames) often sits directly on top of video content, dynamic text shadows or subtle dark gradients behind text areas must be used to guarantee readability regardless of the video's brightness.
