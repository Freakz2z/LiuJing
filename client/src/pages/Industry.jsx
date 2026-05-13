import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { publicApi } from '../utils/api';
import './Industry.css';

export default function Industry() {
  const [regions, setRegions] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapChartRef = useRef(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [regionsRes, industryRes] = await Promise.all([
        publicApi.getRegions(),
        publicApi.getIndustryItems()
      ]);
      setRegions(regionsRes.list || []);
      setIndustryData(industryRes.list || []);
    } catch (e) {
      console.error('Failed to fetch industry data:', e);
    } finally {
      setLoading(false);
    }
  };

  const getRegionStats = (regionId) => {
    const items = industryData.filter(i => i.region_id === regionId);
    return {
      total: items.length,
      categories: {
        '种苗繁育': items.filter(i => i.category === '种苗繁育').length,
        '规模化种植': items.filter(i => i.category === '规模化种植').length,
        '加工分选': items.filter(i => i.category === '加工分选').length,
        '文旅博览': items.filter(i => i.category === '文旅博览').length,
      }
    };
  };

  useEffect(() => {
    if (!loading && regions.length > 0 && industryData.length > 0 && mapChartRef.current) {
      initMap();
    }
  }, [loading, regions, industryData]);

  const loadGeoJson = async () => {
    try {
      const r = await fetch('/hainan.json');
      if (r.ok) return r.json();
    } catch {}
    try {
      const r = await fetch('/api/geo/hainan');
      if (r.ok) return r.json();
    } catch {}
    try {
      const r = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/460000_full.json', {
        headers: { 'Referer': 'http://localhost:5173' }
      });
      if (r.ok) return r.json();
    } catch {}
    return null;
  };

  const initMap = async () => {
    const chartDom = mapChartRef.current;
    if (!chartDom) return;
    const myChart = echarts.init(chartDom);

    const mapData = regions.map(item => {
      const stats = getRegionStats(item.id);
      return { name: item.name, stats, intro: item.intro, overview: item.overview, id: item.id };
    });

    const colorMap = {
      '三亚市': '#1a5c1a',
      '保亭黎族苗族自治县': '#2e7d32',
      '乐东黎族自治县': '#43a047',
      '万宁市': '#66bb6a',
    };

    const option = {
      backgroundColor: '#f4f9f4',
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.data && params.data.stats) {
            return `<strong>${params.data.name}</strong><br/>产业项目：${params.data.stats.total}个`;
          }
          return params.name || '';
        }
      },
      geo: {
        map: 'Hainan',
        roam: false,
        zoom: 1.0,
        center: [109.62, 19.0],
        label: { show: false },
        itemStyle: {
          areaColor: '#e8f5e9',
          borderColor: '#a5d6a7',
          borderWidth: 1,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#b2dfb2',
            shadowBlur: 8,
            shadowColor: 'rgba(0,0,0,0.2)'
          },
          label: { show: false }
        },
        regions: Object.entries(colorMap).map(([name, color]) => ({
          name,
          itemStyle: { areaColor: color }
        }))
      }
    };

    myChart.off('click');
    myChart.on('click', (params) => {
      if (!params.name) return;
      const regionName = params.name;
      const normalize = (n) => n.replace('市', '').replace('黎族苗族自治县', '').replace('黎族自治县', '');
      const matched = mapData.find(r =>
        r.name === regionName || normalize(r.name) === normalize(regionName)
      );
      if (matched) setSelectedRegion(matched);
    });

    const geoJson = await loadGeoJson();
    if (geoJson) {
      if (geoJson.features) {
        geoJson.features = geoJson.features.filter(f => !f.properties?.name?.includes('三沙'));
      }
      echarts.registerMap('Hainan', geoJson);
      myChart.setOption(option);
    } else {
      myChart.dispose();
    }

    window.addEventListener('resize', () => myChart.resize());
  };

  const getCategoryColor = (cat) => {
    const colors = { '种苗繁育': '#4caf50', '规模化种植': '#2196f3', '加工分选': '#ff9800', '文旅博览': '#9c27b0' };
    return colors[cat] || '#757575';
  };

  const getCategoryIcon = (cat) => {
    const icons = { '种苗繁育': '●', '规模化种植': '■', '加工分选': '▲', '文旅博览': '◆' };
    return icons[cat] || '○';
  };

  if (loading) {
    return <div className="industry-loading">加载中...</div>;
  }

  return (
    <div className="industry-page">
      <div className="industry-left">
        <div className="industry-map-container" ref={mapChartRef} />
      </div>
      <div className="industry-right">
        {selectedRegion ? (
          <div className="region-detail">
            <div className="detail-header">
              <h3>{selectedRegion.name}</h3>
              <button className="detail-close" onClick={() => setSelectedRegion(null)}>x</button>
            </div>
            <p className="detail-intro">{selectedRegion.intro}</p>
            {selectedRegion.overview && (
              <p className="detail-overview">{selectedRegion.overview}</p>
            )}
            <div className="detail-divider" />
            <div className="detail-section-title">产业项目</div>
            <div className="detail-items">
              {industryData.filter(i => i.region_id === selectedRegion.id).map(item => (
                <div key={item.id} className="detail-card">
                  <div className="detail-card-top">
                    <span className="detail-icon" style={{ color: getCategoryColor(item.category) }}>{getCategoryIcon(item.category)}</span>
                    <span className="detail-category" style={{ color: getCategoryColor(item.category) }}>{item.category}</span>
                  </div>
                  <div className="detail-name">{item.name}</div>
                  <div className="detail-fields">
                    {item.position && <div>位置：{item.position}</div>}
                    {item.area && <div>面积：{item.area}</div>}
                    {item.capacity && <div>产能：{item.capacity}</div>}
                    {item.varieties && <div>品种：{item.varieties}</div>}
                    {item.brand && <div>品牌：{item.brand}</div>}
                    {item.features && <div>特点：{item.features}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="region-overview-panel">
            <div className="overview-title">海南榴莲产业概览</div>

            <div className="overview-section">
              <div className="overview-section-label">全省总面积</div>
              <div className="overview-stat-row">
                <div className="overview-stat-block">
                  <div className="overview-stat-big">4.5万亩</div>
                  <div className="overview-stat-desc">总种植面积</div>
                </div>
                <div className="overview-stat-block">
                  <div className="overview-stat-big">90%</div>
                  <div className="overview-stat-desc">集中在四大产区</div>
                </div>
                <div className="overview-stat-block">
                  <div className="overview-stat-big">18°</div>
                  <div className="overview-stat-desc">北纬黄金种植带</div>
                </div>
              </div>
            </div>

            <div className="overview-divider" />

            <div className="overview-section">
              <div className="overview-section-label">核心产区分布</div>
              <div className="overview-region-grid">
                <div className="overview-region-item">
                  <div className="overview-region-name" style={{color: '#1a5c1a'}}>三亚市</div>
                  <div className="overview-region-desc">海南榴莲产业核心产区之首，北纬18度黄金种植带，年均气温22-26度，雨量充沛，是国内首个规模化榴莲种植区，拥有大型种苗基地和全国最大种植基地。</div>
                </div>
                <div className="overview-region-item">
                  <div className="overview-region-name" style={{color: '#2e7d32'}}>保亭黎族苗族自治县</div>
                  <div className="overview-region-desc">位于海南中部热带季风气候区，七仙岭脚下，森林覆盖率近80%，是海南榴莲种植的黄金地带，拥有全球热带水果博览中心和多个规模化种植基地。</div>
                </div>
                <div className="overview-region-item">
                  <div className="overview-region-name" style={{color: '#43a047'}}>乐东黎族苗族自治县</div>
                  <div className="overview-region-desc">海南榴莲产业西线最大产区，年均气温24-27度，日照充足，适合榴莲规模化种植，拥有连片万亩种植基地，产量大、成本低，是批发流通的核心集散地。</div>
                </div>
                <div className="overview-region-item">
                  <div className="overview-region-name" style={{color: '#66bb6a'}}>万宁市</div>
                  <div className="overview-region-desc">海南榴莲产业东线新兴产区，热带季风气候区，是东线最大榴莲基地，与当地合作村共同打造"南桥榴莲"区域品牌，发展采摘游和电商直销。</div>
                </div>
              </div>
            </div>

            <div className="overview-divider" />

            <div className="overview-section">
              <div className="overview-section-label">功能分类</div>
              <div className="overview-cat-list">
                <div className="overview-cat-item">
                  <span className="overview-cat-dot" style={{background: '#4caf50'}}></span>
                  <span>种苗繁育区</span>
                  <span className="overview-cat-note">优质种苗研发与培育</span>
                </div>
                <div className="overview-cat-item">
                  <span className="overview-cat-dot" style={{background: '#2196f3'}}></span>
                  <span>规模化种植区</span>
                  <span className="overview-cat-note">标准化大面积种植</span>
                </div>
                <div className="overview-cat-item">
                  <span className="overview-cat-dot" style={{background: '#ff9800'}}></span>
                  <span>加工分选区</span>
                  <span className="overview-cat-note">采摘后处理与分级</span>
                </div>
                <div className="overview-cat-item">
                  <span className="overview-cat-dot" style={{background: '#9c27b0'}}></span>
                  <span>文旅博览区</span>
                  <span className="overview-cat-note">观光采摘与文化展示</span>
                </div>
              </div>
            </div>

            <div className="overview-hint">点击地图区域查看各产区详情</div>
          </div>
        )}
      </div>
    </div>
  );
}
