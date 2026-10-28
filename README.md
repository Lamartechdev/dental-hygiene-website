# Concorde Hygiene Program: Free Dental Cleaning Signup Website

## Overview
A website built to help a dental hygiene student at Concorde Career College sign up patients for the 60 supervised dental cleanings needed to complete her clinical requirements. Visitors can learn about the program, see the process, and submit their contact info and availability through a signup form.

A serverless booking system (Lambda, DynamoDB, API Gateway) is being added so patients can pick open time slots directly.

**Live site:** https://smilewithjay.com

---

## Purpose
This is my first portfolio project as I transition from fuel hauling into IT/cloud support. It demonstrates:
- Front-end development (HTML/CSS, Bootstrap 5)
- Customizing a third-party template
- Form handling through a third-party service (Formspree)
- Secure static hosting on AWS (private S3 bucket behind CloudFront with OAC)
- Custom domain and HTTPS (Route 53, ACM)
- Serverless backend development (Lambda, DynamoDB, least-privilege IAM)

What the site does for patients:
- Lets community members request free dental cleanings
- Collects name, email, phone, and preferred availability
- Routes form submissions to a designated email through Formspree

---

## Architecture

```
Visitor → Route 53 (DNS) → CloudFront (HTTPS, ACM certificate) → S3 bucket (private, OAC)

API endpoint: https://498pqb5lq4.execute-api.us-east-1.amazonaws.com/slots

Booking system (in progress):
Browser → API Gateway → Lambda (Python, arm64) → DynamoDB
                                     └→ SES email alerts (planned)
```

| Service | Role |
|---|---|
| Amazon S3 | Stores the site files. Private bucket, Block Public Access on, static website hosting off |
| Amazon CloudFront | Serves the site over HTTPS (TLSv1.2_2021, HTTP/2) using Origin Access Control |
| AWS Certificate Manager | TLS certificate for the root domain and wildcard subdomain, validated through Route 53 |
| Amazon Route 53 | Hosted zone and alias record to CloudFront (domain registered at Namecheap) |
| AWS Lambda | Backend functions for the booking system (Python, arm64 / Graviton) |
| Amazon DynamoDB | Stores time slots and patient request (on-demand capacity) |
| Amazon API Gateway | In progress |
| Amazon SES | Planned, for email alerts on new bookings |

---

## Security Decisions
- **Private S3 bucket.** Only this CloudFront distribution can read it, through Origin Access Control. The bucket policy includes an `AWS:SourceArn` condition to prevent the confused deputy problem.
- **No direct S3 access.** Static website hosting is disabled and Block Public Access is on, so direct S3 links return Access Denied.
- **Least privilege for Lambda.** Each function's role gets only the actions it needs, on only the table it uses. For example, `getOpenSlots` can only `Scan` the slots table.
- **CORS locked to the site.** The Lambda response only allows browser requests from `https://smilewithjay.com`.
- **Account protection.** The root user is protected with MFA and isn't used for daily work. Day-to-day access is through IAM Identity Center with its own MFA.
- **No health information** is collected on the signup form.

---

## Data Model (DynamoDB)

| Table | Partition key | Notes |
|---|---|---|
| `smilewithj-slots` | `slotId` (String), e.g. `2026-11-05T10:00` | `status` attribute: `open` → `booked` → `completed`, or `no-show`. Completed slots are counted to track progress toward 60 cleanings |
| `smilewithj-request` | `requestId` (String) | Requests for times outside the open slots, held as pending until confirmed or declined |

Both tables use on-demand capacity, deletion protection, and the tag `Project = smilewithj`. Booking will use a DynamoDB conditional write so two patients can't take the same slot.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | HTML5, CSS3, Bootstrap 5, Bootstrap Icons |
| Template base | Start Bootstrap Creative |
| Form handling | Formspree (until the AWS booking backend is live) |
| Backend | AWS Lambda (Python), DynamoDB, API Gateway |
| Hosting | S3 + CloudFront, Route 53, ACM |
| Development | VS Code + Live Server, GitHub Desktop |

---

## Repo Layout

```
index.html                  Main page
css/                        Styles
js/                         Scripts
assets/                     Images
backend/getOpenSlots/       Lambda function that lists open time slots
infra/policies/             IAM policy for the Lambda role and the S3 bucket policy
```

---

## Site Sections
1. **Home / Hero**: headline, tagline, and "Find Out More" button
2. **About Jay-An**: bio section over a background photo
3. **The Process**: 3-step signup flow with icons (Fill Out the Form, Tell Us Your Availability, We'll Contact You)
4. **Call-to-Action banner**: "Ready to get your free dental cleaning?" and a Sign Up button
5. **Contact / Signup Form**: name, email, phone, and message, submitted through Formspree

### Hero
- Custom headline and supporting copy
- Dental background image with a dark overlay
- Call-to-action button that smoothly scrolls to the next section

### Process
- Rebuilt from the original 4-column "At Your Service" layout into a 3-step process using the Bootstrap grid (`col-lg-4`)
- Custom background image with overlay
- Adjusted section height and padding for full visual coverage

### About
- Written biography
- Personal photo as the background, with tuned opacity and positioning
- Several iterations of `background-size`, `background-position`, and overlay opacity to frame the subject correctly

### Contact / Signup Form
- Replaced the original Start Bootstrap form with a working Formspree endpoint
- Fields: name, email, phone, message
- Client-side validation with HTML5 `required` attributes

### Navigation and Branding
- Updated navigation links and active states
- Custom page title and navbar brand
- Consistent internal anchors (`#about`, `#process`, `#contact`)

---

## Changes Made From the Original Template
- Reordered sections: Home → About Jay-An → The Process → CTA → Contact form
- Rewrote all placeholder text (headings, paragraphs, form copy)
- Fixed background image sizing on the About section (`background-size: cover`, `min-height: 750px`)
- Removed "Contact" from the top nav bar (the form section stays, it just isn't linked in the nav)
- Swapped the Process icons to `bi-clipboard-check`, `bi-calendar-check`, and `bi-telephone`
- Fixed the "Find Out More" button link target
- Added paragraph spacing (`mb-4`) in the About section for readability
- Connected the form to Formspree and routed submissions to the recipient email
- Updated the footer copyright year and name

---

## Key Technical Challenges and Solutions

| Challenge | Solution |
|---|---|
| Bootstrap 4-column layout → 3 columns | Changed `col-lg-3` to `col-lg-4` and removed the fourth column |
| Background image splitting or tiling | Forced `background-size: cover` and `background-repeat: no-repeat`, with `!important` overrides |
| Wrong face framing on the personal photo | Iterated on `background-position` and section `min-height` |
| Disabled form submit button | Removed the Start Bootstrap form scripts and used a native Formspree POST |
| Section height not covering the background | Added an explicit `min-height` and more vertical padding |
| Bucket was publicly readable through the S3 website endpoint | Switched CloudFront to the S3 REST endpoint with OAC, disabled static website hosting, turned on Block Public Access |

---

## Deployment
1. Edit files locally in VS Code, then commit and push with GitHub Desktop.
2. Upload changed site files to the S3 bucket.
3. Create a CloudFront invalidation for `/*` so visitors get the new version.

Lambda code is currently deployed by pasting into the Lambda console. The copy in `backend/` is the source of truth.

## How to Run Locally
1. Clone or download this repo.
2. Open `index.html` in any browser. There's no build step.

---

## Status
- [x] Static site live with HTTPS and a custom domain
- [x] S3 locked down with Origin Access Control
- [x] DynamoDB tables created
- [x] First Lambda function (`getOpenSlots`) working
- [x] Booking Lambda (bookSlot) with conditional write to prevent double booking
- [ ] API Gateway
- [ ] Booking section on the page (replaces the current contact form)
- [ ] SES email alerts
- [ ] Booking and request Lambda functions
- [x] Request Lambda (submitRequest) for times outside open slots
---

## Skills Demonstrated
- Customizing a production Bootstrap template
- Writing and overriding CSS for complex background behavior
- Integrating third-party form services
- Securing static hosting with CloudFront, OAC, and bucket policies
- Writing least-privilege IAM policies
- Designing DynamoDB tables and writing Lambda functions in Python
- Version control and documentation with Git and GitHub
- Iterative debugging and visual refinement

## Author
Joshua L. Grant (Lamar Tech Development). Built as part of a career transition from commercial trucking into cloud/IT support.