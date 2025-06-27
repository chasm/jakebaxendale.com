# Carousel Image Optimization Guide - Updated

## Target Sizes (Height-Based, Optimized for Column Width)

The carousel uses fixed-height containers optimized so that landscape images (3:2 ratio) fill the full width of the column.

### Mobile (395px column width)

- **263px height** - Landscape images will be 395×263px, filling full width
- **526px height** - 2x density for mobile

### Desktop (860px column width)

- **573px height** - Landscape images will be 860×573px, filling full width
- **1146px height** - 2x density for desktop

## Folder Structure

```
public/images/carousel/
├── 263/          # Mobile 1x (landscape: 395×263px)
├── 526/          # Mobile 2x (landscape: 790×526px)
├── 573/          # Desktop 1x (landscape: 860×573px)
└── 1146/         # Desktop 2x (landscape: 1720×1146px)
```

## Optimization Workflow

### Step 1: Resize Images

For each folder, resize images to the target HEIGHT while maintaining aspect ratio:

**263px folder:**

- Target: 263px height
- Landscape images will become ~395×263px
- Portrait images will become ~175×263px

**526px folder:**

- Target: 526px height
- Landscape images will become ~790×526px
- Portrait images will become ~351×526px

**573px folder:**

- Target: 573px height
- Landscape images will become ~860×573px
- Portrait images will become ~382×573px

**1146px folder:**

- Target: 1146px height
- Landscape images will become ~1720×1146px
- Portrait images will become ~764×1146px

### Step 2: Generate Additional Formats

After resizing JPEGs, generate WebP and AVIF versions:

- Use high quality settings (85-90% for JPEG/WebP, high quality for AVIF)
- Maintain the Mitchell resampling algorithm for best photo quality

### Step 3: Result

- Landscape images will perfectly fill the column width
- Portrait images will be centered horizontally with black bars
- Fixed container height ensures no vertical layout shifts
- All images optimized for their display context

## Benefits of This Approach

1. **Landscape images fill full width** - maximizes use of available space
2. **Fixed height containers** - no layout shift as users browse
3. **Optimized file sizes** - each image sized for its exact display context
4. **Progressive enhancement** - works without JS, enhanced with navigation controls
