# Waypeople Carousel Image Optimization Guide

## Target Heights for Each Folder:

### Mobile Sizes (for 300px container):

- **300/** - Mobile 1x density (base)
- **600/** - Mobile 2x density (Retina)
- **900/** - Mobile 3x density (high-end)

### Desktop Sizes (for 400px container):

- **400/** - Desktop 1x density (base)
- **800/** - Desktop 2x density (Retina)
- **1200/** - Desktop 3x density (high-end)

## Aspect Ratios Present:

- **Landscape**: 3:2 ratio (2000×1333 originals)
- **Portrait**: 2:3 ratio (1333×2000 originals)
- **Square**: 1:1 ratio (2000×2000 originals)

## Optimization Instructions:

1. **Keep aspect ratios intact** - resize by height only
2. **Create 3 formats per image**: AVIF, WebP, JPEG
3. **Maintain high quality** for performance photos

## Example Dimensions After Resizing:

### For 400px height:

- Landscape (3:2): 400×400 → 600×400
- Portrait (2:3): 400×400 → 400×600
- Square (1:1): 400×400 → 400×400

### For 600px height:

- Landscape (3:2): 600×600 → 900×600
- Portrait (2:3): 600×600 → 600×900
- Square (1:1): 600×600 → 600×600

## File Structure After Optimization:

```
public/images/carousel/
  300/
    waypeople-01.avif
    waypeople-01.webp
    waypeople-01.jpeg
    ...
  400/
    waypeople-01.avif
    waypeople-01.webp
    waypeople-01.jpeg
    ...
  (etc for all height folders)
```

## Current Status:

✅ Folders created ✅ JPEG source images copied to all folders ⏳ **TODO**: Resize each folder's images to target height + create AVIF/WebP versions
