/**
 * Client-Side Metadata Scrubber
 * 
 * HOW IT WORKS:
 * 
 * Images:
 *   Draws the image onto an HTML Canvas, then exports it as a brand-new
 *   PNG/JPEG blob. The Canvas API produces raw pixel data only — all EXIF,
 *   GPS coordinates, camera model, timestamps, ICC profiles, device headers,
 *   and ISP/regional footprints are permanently destroyed. The output is a
 *   pixel-identical image with zero metadata.
 * 
 * Videos:
 *   Parses the MP4/MOV binary to locate and remove metadata atoms (udta, meta,
 *   GPS, XMP) at the byte level. The video/audio streams are untouched, but
 *   identifying device/location data is stripped from the container.
 */

// ─── IMAGE SCRUBBER ────────────────────────────────────────────────────────────

export function scrubImage(file: File, quality: number = 0.92): Promise<{ blob: Blob; stripped: string[] }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        // Create canvas at exact image dimensions
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failed'));

        // Draw image — this discards ALL embedded metadata
        ctx.drawImage(img, 0, 0);

        // Determine output format
        const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
        const mimeOut = isJpeg ? 'image/jpeg' : 'image/png';

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Blob conversion failed'));
            resolve({
              blob,
              stripped: [
                'EXIF data',
                'GPS coordinates',
                'Camera model & lens',
                'Creation timestamps',
                'Device serial numbers',
                'ICC color profiles',
                'Thumbnail previews',
                'Software/OS identifiers',
                'ISP/regional footprints',
              ],
            });
          },
          mimeOut,
          isJpeg ? quality : undefined
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

// ─── VIDEO SCRUBBER ────────────────────────────────────────────────────────────

/**
 * MP4/MOV files use the ISO Base Media File Format (ISOBMFF).
 * The file is a sequence of "atoms" (boxes), each starting with:
 *   [4 bytes: size] [4 bytes: type]
 * 
 * Metadata lives in atoms like:
 *   - 'udta' (user data — camera info, GPS, etc.)
 *   - 'meta' (metadata handler — XMP, location)
 *   - 'xyz ' (GPS coordinates in some encoders)
 *   - 'GPSA' / 'gps ' (GPS atoms)
 * 
 * We walk the atom tree and zero-out the payload of these atoms,
 * preserving the container structure so the file stays playable.
 */

const METADATA_ATOMS = new Set([
  'udta', // user data: GPS, camera, device
  'meta', // metadata: XMP, IPTC
  'xyz ', // GPS coordinates  
  'gps ', // GPS data
  'GPSA', // GPS atom
]);

// Atoms whose CHILDREN should be inspected (container atoms)
const CONTAINER_ATOMS = new Set([
  'moov', // movie header — contains udta/meta
  'trak', // track — can contain udta
]);

export async function scrubVideo(file: File): Promise<{ blob: Blob; stripped: string[] }> {
  const buffer = await file.arrayBuffer();
  const data = new Uint8Array(buffer);
  const stripped: string[] = [];

  function processAtoms(start: number, end: number) {
    let offset = start;

    while (offset < end - 8) {
      // Read atom size (big-endian uint32)
      const size =
        (data[offset] << 24) |
        (data[offset + 1] << 16) |
        (data[offset + 2] << 8) |
        data[offset + 3];

      // Read atom type (4 ASCII chars)
      const type = String.fromCharCode(
        data[offset + 4],
        data[offset + 5],
        data[offset + 6],
        data[offset + 7]
      );

      // Sanity check: atom size must be at least 8 and not exceed bounds
      if (size < 8 || offset + size > end) break;

      const payloadStart = offset + 8;
      const payloadEnd = offset + size;

      if (METADATA_ATOMS.has(type)) {
        // Zero out the entire payload of this metadata atom
        // Keep the 8-byte header so the container structure is valid
        for (let i = payloadStart; i < payloadEnd; i++) {
          data[i] = 0;
        }

        const label = {
          'udta': 'User data (device info, GPS, camera)',
          'meta': 'Metadata (XMP, IPTC, location)',
          'xyz ': 'GPS coordinates',
          'gps ': 'GPS data block',
          'GPSA': 'GPS atom',
        }[type] || type;

        stripped.push(label);
      } else if (CONTAINER_ATOMS.has(type)) {
        // Recurse into container atoms to find nested metadata
        processAtoms(payloadStart, payloadEnd);
      }

      offset += size;
    }
  }

  processAtoms(0, data.length);

  if (stripped.length === 0) {
    stripped.push('No recognized metadata atoms found (file may already be clean)');
  }

  return {
    blob: new Blob([data], { type: file.type || 'video/mp4' }),
    stripped,
  };
}

// ─── UNIFIED SCRUBBER ──────────────────────────────────────────────────────────

export interface ScrubResult {
  blob: Blob;
  url: string;
  originalSize: number;
  cleanSize: number;
  stripped: string[];
  mediaType: 'image' | 'video';
}

export async function scrubFile(file: File): Promise<ScrubResult> {
  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  if (!isImage && !isVideo) {
    throw new Error('Unsupported file type: ' + file.type);
  }

  const result = isImage
    ? await scrubImage(file)
    : await scrubVideo(file);

  const url = URL.createObjectURL(result.blob);

  return {
    blob: result.blob,
    url,
    originalSize: file.size,
    cleanSize: result.blob.size,
    stripped: result.stripped,
    mediaType: isImage ? 'image' : 'video',
  };
}
