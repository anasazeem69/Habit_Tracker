// Simple Grid Service - No external dependencies
console.log('✅ Simple Grid Service loaded (no dependencies)');

// Simple hexagonal grid implementation
export const HEX_SIZE_SMALL = 0.0009; // ~100m
export const HEX_SIZE_LARGE = 0.009;  // ~1km

const getHexSize = (resolution) => {
  return resolution === 'LARGE' ? HEX_SIZE_LARGE : HEX_SIZE_SMALL;
};

export const getCellFromLocation = (lat, lng, resolution = 'SMALL') => {
  const size = getHexSize(resolution);
  // Create a cell ID based on rounded coordinates and resolution
  const cellLat = Math.floor(lat / size);
  const cellLng = Math.floor(lng / size);
  const resKey = resolution === 'LARGE' ? 'L' : 'S';

  // Format: Lat_Lng_Resolution
  return `${cellLat}_${cellLng}_${resKey}`;
};

export const getNeighboringCells = (cellId, radius = 1) => {
  if (!cellId) return [];
  const parts = cellId.split('_');
  const lat = Number(parts[0]);
  const lng = Number(parts[1]);
  const resKey = parts[2] || 'S'; // Default to Small if missing

  const cells = [];

  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      cells.push(`${lat + i}_${lng + j}_${resKey}`);
    }
  }

  // console.log(`🗺️ Grid: Showing ${cells.length} cells (Res: ${resKey})`);
  return cells;
};

export const getCellBoundary = (cellId) => {
  if (!cellId) return [];
  const parts = cellId.split('_');
  const latIndex = Number(parts[0]);
  const lngIndex = Number(parts[1]);
  const resKey = parts[2] || 'S';

  const size = resKey === 'L' ? HEX_SIZE_LARGE : HEX_SIZE_SMALL;

  // Center of the logical square grid
  const centerLat = (latIndex + 0.5) * size;
  const centerLng = (lngIndex + 0.5) * size;

  // Create a simple hexagonal boundary around the center
  // Hexagon radius approx size * 0.5 to cover the square roughly
  // Adjusting radius to cover the square better (approx 0.6 * size as circumradius)
  // But strictly adhering to previous shape size:
  return [
    { latitude: centerLat + size * 0.5, longitude: centerLng },
    { latitude: centerLat + size * 0.25, longitude: centerLng + size * 0.433 },
    { latitude: centerLat - size * 0.25, longitude: centerLng + size * 0.433 },
    { latitude: centerLat - size * 0.5, longitude: centerLng },
    { latitude: centerLat - size * 0.25, longitude: centerLng - size * 0.433 },
    { latitude: centerLat + size * 0.25, longitude: centerLng - size * 0.433 },
  ];
};

export const getCellCenter = (cellId) => {
  if (!cellId) return { latitude: 0, longitude: 0 };
  const parts = cellId.split('_');
  const latIndex = Number(parts[0]);
  const lngIndex = Number(parts[1]);
  const resKey = parts[2] || 'S';

  const size = resKey === 'L' ? HEX_SIZE_LARGE : HEX_SIZE_SMALL;

  return {
    latitude: (latIndex + 0.5) * size,
    longitude: (lngIndex + 0.5) * size,
  };
};

export const getCellsInRegion = (region, resolution = 'SMALL') => {
  if (!region) return [];
  const size = getHexSize(resolution);
  const resKey = resolution === 'LARGE' ? 'L' : 'S';

  // Calculate bounds
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;

  // Calculate grid indices
  const minLatIdx = Math.floor(minLat / size);
  const maxLatIdx = Math.floor(maxLat / size);
  const minLngIdx = Math.floor(minLng / size);
  const maxLngIdx = Math.floor(maxLng / size);

  // Safety clamp: Limit to ~400 cells (20x20) to prevent performance nuke if zoomed out too far
  const latCount = maxLatIdx - minLatIdx;
  const lngCount = maxLngIdx - minLngIdx;

  // If user zooms out too much, we just return empty or a small area center?
  // Let's just clamp the loop range to avoid freezing UI
  if (latCount * lngCount > 600) {
    console.warn('⚠️ Map zoomed out too far for grid rendering.');
    return [];
  }

  const cells = [];
  for (let lat = minLatIdx; lat <= maxLatIdx; lat++) {
    for (let lng = minLngIdx; lng <= maxLngIdx; lng++) {
      cells.push(`${lat}_${lng}_${resKey}`);
    }
  }

  return cells;
};
