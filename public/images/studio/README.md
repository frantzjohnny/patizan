# Patizan Records — Studio Photography Directory

Place all official, high-resolution photographs of Patizan Records facilities directly in this directory:
`public/images/studio/`

These images are statically served in production and directly power the public **Studio Tour page (`/studio`)**, the **Homepage Facility Showcase ("THE SPACE ITSELF")**, and the **OpenGraph / Twitter Social Sharing SEO image**.

---

## 📸 Standard Expected Filenames

| Facility / Room | Recommended Filename | Supported Formats | Primary Page Slot |
|---|---|---|---|
| **Control Room** *(Hero & SEO Image)* | `control-room.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Homepage Large Card, Studio Hero, OpenGraph Image |
| **Recording & Vocal Booth** | `recording-booth.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 02, Homepage Grid Slot 2 |
| **Podcast & Broadcast Suite** | `podcast-setup.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 03, Homepage Grid Slot 3 |
| **Equipment & Outboard Gear** | `equipment.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 04, Homepage Grid Slot 4 |
| **Live Tracking Room** | `live-room.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 05 |
| **Studio Interior Lounge** | `studio-interior.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 06 |
| **Studio Exterior & Entrance** | `studio-exterior.jpg` | `.jpg`, `.jpeg`, `.png`, `.webp` | Studio Section 07 |

---

## 💡 Notes
- If you use `.png` or `.webp` instead of `.jpg`, you can update the file path directly in [`src/data/studioImages.ts`](file:///src/data/studioImages.ts).
- For optimal web performance, images should ideally be **1920x1080** or **1200x800** at 72-96 DPI.
