# Concorde Hygiene Program — Free Dental Cleaning Signup Website

## Overview
A static website built to help a dental hygiene student at Concorde Career College sign up patients for the 60 supervised dental cleanings needed to complete clinical patient requirements. Visitors can learn about the program, see the process, and submit their contact info and availability through a signup form.

**Live site:** *(add your S3/CloudFront URL here once deployed)*

---

## Purpose
This project is also my first portfolio piece as I transition from truck driving into IT/cloud support. It's meant to demonstrate:
- Front-end development (HTML/CSS, Bootstrap)
- Working with a third-party template and customizing it
- Form handling via a third-party service (Formspree)
- Static site deployment on AWS (S3 + CloudFront)
- Allow community members to request free dental cleanings
- Collect name, email, phone, and preferred availability
- Route form submissions to a designated email via Formspree
---

## Tech Stack
| Category          | Technology                  |
|-------------------|-----------------------------|
| Frontend          | HTML5, CSS3, Bootstrap 5    |
| Template Base     | Start Bootstrap Creative    |
| Form Handling     | Formspree                   |
| Development       | VS Code + Live Server       |
| Deployment Target | AWS S3 (Static Website)     |
- **HTML5 / CSS3** — page structure and styling
- **Bootstrap 5** — layout, responsive grid, nav bar
- **Bootstrap Icons** — icons for The Process section
- **Formspree** — handles contact/signup form submissions, routes to email, no backend needed
- **AWS S3** — static file hosting
- **AWS CloudFront** — CDN in front of S3 (planned)

---

## Site Sections
1. **Home / Hero** — headline, tagline, "Find Out More" CTA button,
2. **The Process** — 3-step signup flow with icons (Fill Out the Form, Tell Us Your Availability, We'll Contact You)
3. **About Jay-An** — bio section over background photo
4. **Contact / Signup Form** — Full name, email, phone, message — submits via Formspree
5. **Call-to-Action banner** — "Ready to get your free dental cleaning?" + Sign Up button

---

### 1. Hero Section
- Custom headline and supporting copy
- Professional dental background image with dark overlay
- Call-to-action button that smoothly scrolls to the Process section (`#process`)

### 2. Process Section
- Completely rebuilt from the original 4-column “At Your Service” layout
- Converted into a clean 3-step process using Bootstrap grid (`col-lg-4`)
- Custom background image with overlay
- Adjusted section height and padding for full visual coverage

### 3. About Section
- Professionally written biography
- Personal photo used as background with controlled opacity and positioning
- Multiple iterations of `background-size`, `background-position`, and overlay opacity to correctly frame the subject

### 4. Contact / Sign-Up Form
- Replaced the original Start Bootstrap form
- Implemented a working Formspree endpoint
- Form fields: Name, Email, Phone, Message
- Client-side validation with HTML5 `required` attributes
- Submissions delivered directly to a configured email address

### 5. Navigation & Branding
- Updated navigation links and active states
- Custom page title and navbar brand
- Consistent internal anchoring (`#about`, `#process`, `#signup`, `#contact`)

## Key Technical Challenges & Solutions

| Challenge | Solution |
|---------|----------|
| Bootstrap 4-column layout → 3 columns | Changed `col-lg-3` to `col-lg-4` and removed the fourth column |
| Background image splitting / tiling | Forced `background-size: cover`, `background-repeat: no-repeat`, and used `!important` overrides |
| Incorrect face framing on personal photo | Iterated `background-position` and section `min-height` |
| Disabled form submit button | Removed Start Bootstrap form scripts and replaced with native Formspree POST |
| Section height not covering background | Added explicit `min-height` and increased vertical padding |

## Changes Made From Original Template
Started from the **Start Bootstrap "Creative"** template and customized:
- [ ] Reordered sections: Home → About Jay-An → The Process → CTA → Contact form
- [ ] Rewrote all template placeholder text (headings, paragraphs, form copy)
- [ ] Fixed background image sizing on About section (`background-size: cover`, `min-height: 750px`)
- [ ] Removed "Contact" from top nav bar (kept the form section itself, just not linked in nav)
- [ ] Swapped Process icons from Bootstrap Icons defaults to: `bi-clipboard-check`, `bi-calendar-check`, `bi-telephone`
- [ ] Fixed "Find Out More" button link target (`#about` instead of `#process`)
- [ ] Added paragraph spacing (`mb-4`) in About Jay-An section for readability
- [ ] Connected form to Formspree, routed submissions to recipient email
- [ ] Updated footer copyright year and company name

---

## Deployment Plan
1. Upload all files to an S3 bucket
2. Enable Static Website Hosting
3. Set up CloudFront distribution in front of S3 bucket
4. Set `index.html` as the Index document
5. Configure bucket policy for public read access
6. Test responsiveness on mobile browser

## Skills Demonstrated
- Customizing a production Bootstrap template
- Writing and overriding CSS for complex background behavior
- Integrating third-party form services
- Preparing a static site for cloud hosting
- Iterative debugging and visual refinement
- Version control readiness (GitHub documentation)

## Author
Built as a hands-on learning project while transitioning into cloud engineering.

## How to Run Locally
1. Clone or download this repo
2. Open `index.html` in any browser (no build step needed — it's a static site)

---

## Deployment Notes
*(Fill in once S3 setup is done — bucket name, region, whether CloudFront is attached, etc.)*

---



## Author
Joshua L. Grant — built as part of a career transition from commercial trucking into cloud/IT support.
