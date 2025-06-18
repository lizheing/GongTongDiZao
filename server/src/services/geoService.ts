import db from '../config/db';

export const geoService = {
  // 获取所有空间数据
  async getAllFeatures() {
    try {
      const features = await db.any(`
        SELECT 
          id,
          name,
          type,
          ST_AsGeoJSON(geom)::json as geometry,
          description,
          created_at
        FROM spatial_features
      `);
      return features;
    } catch (error) {
      console.error('Error fetching features:', error);
      throw error;
    }
  },

  // 获取指定区域内的空间数据
  async getFeaturesInArea(bbox: number[]) {
    try {
      const features = await db.any(`
        SELECT 
          id,
          name,
          type,
          ST_AsGeoJSON(geom)::json as geometry,
          description,
          created_at
        FROM spatial_features
        WHERE ST_Intersects(
          geom,
          ST_MakeEnvelope($1, $2, $3, $4, 4326)
        )
      `, bbox);
      return features;
    } catch (error) {
      console.error('Error fetching features in area:', error);
      throw error;
    }
  },

  // 添加新的空间数据
  async addFeature(feature: any) {
    try {
      const result = await db.one(`
        INSERT INTO spatial_features (name, type, geom, description)
        VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4)
        RETURNING id
      `, [feature.name, feature.type, JSON.stringify(feature.geometry), feature.description]);
      return result;
    } catch (error) {
      console.error('Error adding feature:', error);
      throw error;
    }
  },

  // 获取武汉市地图数据，返回标准GeoJSON
  async getWuhanMap() {
    try {
      const rows = await db.any(`
        SELECT 
          gid,
          "name" as name,
          ST_AsGeoJSON(geom)::json as geometry
        FROM wuhan
      `);
      const features = rows.map((row: any) => ({
        type: 'Feature',
        properties: {
          gid: row.gid,
          name: row.name
        },
        geometry: row.geometry
      }));
      return {
        type: 'FeatureCollection',
        features
      };
    } catch (error) {
      console.error('获取武汉市地图数据失败:', error);
      throw error;
    }
  }
}; 