export interface TilesetData {
  firstgid: number;
  name: string;
  tileWidth: number;
  tileHeight: number;
  tileCount: number;
  columns: number;
  imageSource: string;
  imageWidth: number;
  imageHeight: number;
  properties?: Record<string, string | number>;
  tileProperties?: Record<number, Record<string, string | number>>;
}

export interface LayerData {
  id: number;
  name: string;
  width: number;
  height: number;
  data: number[];
}

export interface MapData {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  tilesets: TilesetData[];
  layers: LayerData[];
}

export async function parseTMX(url: string): Promise<MapData> {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'text/xml');
  
  const mapEl = xml.querySelector('map');
  if (!mapEl) throw new Error('Invalid TMX file');
  
  const mapData: MapData = {
    width: parseInt(mapEl.getAttribute('width') || '0'),
    height: parseInt(mapEl.getAttribute('height') || '0'),
    tileWidth: parseInt(mapEl.getAttribute('tilewidth') || '16'),
    tileHeight: parseInt(mapEl.getAttribute('tileheight') || '16'),
    tilesets: [],
    layers: [],
  };
  
  // Parse tilesets
  const tilesetEls = xml.querySelectorAll('tileset');
  tilesetEls.forEach(tilesetEl => {
    const imageEl = tilesetEl.querySelector('image');
    if (!imageEl) return;
    
    const tileset: TilesetData = {
      firstgid: parseInt(tilesetEl.getAttribute('firstgid') || '1'),
      name: tilesetEl.getAttribute('name') || '',
      tileWidth: parseInt(tilesetEl.getAttribute('tilewidth') || '16'),
      tileHeight: parseInt(tilesetEl.getAttribute('tileheight') || '16'),
      tileCount: parseInt(tilesetEl.getAttribute('tilecount') || '0'),
      columns: parseInt(tilesetEl.getAttribute('columns') || '1'),
      imageSource: imageEl.getAttribute('source') || '',
      imageWidth: parseInt(imageEl.getAttribute('width') || '0'),
      imageHeight: parseInt(imageEl.getAttribute('height') || '0'),
      properties: {},
      tileProperties: {},
    };
    
    // Parse tileset properties
    const propsEl = tilesetEl.querySelector(':scope > properties');
    if (propsEl) {
      propsEl.querySelectorAll('property').forEach(propEl => {
        const name = propEl.getAttribute('name');
        const value = propEl.getAttribute('value');
        if (name && value && tileset.properties) {
          tileset.properties[name] = isNaN(Number(value)) ? value : Number(value);
        }
      });
    }
    
    // Parse tile-specific properties
    tilesetEl.querySelectorAll('tile').forEach(tileEl => {
      const tileId = parseInt(tileEl.getAttribute('id') || '0');
      const tilePropsEl = tileEl.querySelector('properties');
      if (tilePropsEl && tileset.tileProperties) {
        tileset.tileProperties[tileId] = {};
        tilePropsEl.querySelectorAll('property').forEach(propEl => {
          const name = propEl.getAttribute('name');
          const value = propEl.getAttribute('value');
          if (name && value && tileset.tileProperties) {
            tileset.tileProperties[tileId][name] = isNaN(Number(value)) ? value : Number(value);
          }
        });
      }
    });
    
    mapData.tilesets.push(tileset);
  });
  
  // Parse layers
  const layerEls = xml.querySelectorAll('layer');
  layerEls.forEach(layerEl => {
    const dataEl = layerEl.querySelector('data');
    if (!dataEl) return;
    
    const encoding = dataEl.getAttribute('encoding');
    let tileData: number[] = [];
    
    if (encoding === 'csv') {
      const csvText = dataEl.textContent || '';
      tileData = csvText
        .trim()
        .split(',')
        .map(s => parseInt(s.trim()) || 0);
    }
    
    const layer: LayerData = {
      id: parseInt(layerEl.getAttribute('id') || '0'),
      name: layerEl.getAttribute('name') || '',
      width: parseInt(layerEl.getAttribute('width') || '0'),
      height: parseInt(layerEl.getAttribute('height') || '0'),
      data: tileData,
    };
    
    mapData.layers.push(layer);
  });
  
  return mapData;
}

export function getTilesetForGid(tilesets: TilesetData[], gid: number): TilesetData | null {
  // Find the tileset that contains this gid
  let result: TilesetData | null = null;
  for (const tileset of tilesets) {
    if (gid >= tileset.firstgid && gid < tileset.firstgid + tileset.tileCount) {
      result = tileset;
    }
  }
  return result;
}
