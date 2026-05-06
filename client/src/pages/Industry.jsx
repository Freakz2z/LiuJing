import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as echarts from 'echarts';
import { publicApi } from '../utils/api';
import './Industry.css';

export default function Industry() {
  const navigate = useNavigate();
  const mapChartRef = useRef(null);
  const [regions, setRegions] = useState([]);
  const [industryData, setIndustryData] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  useEffect(() => {
    if (regions.length > 0 && industryData.length > 0) {
      initMap();
    }
  }, [regions, industryData]);

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

  const initMap = () => {
    const chartDom = mapChartRef.current;
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 海南GeoJSON数据（简化版，四个主要地区）
    const geoCoordMap = {
      '三亚市': [109.5117, 18.2528],
      '保亭黎族苗族自治县': [109.7012, 18.6400],
      '乐东黎族苗族自治县': [109.1734, 18.7499],
      '万宁市': [110.3885, 18.7965],
    };

    const convertData = (data) => {
      return data.map(item => {
        const coord = geoCoordMap[item.name];
        const stats = getRegionStats(item.id);
        return {
          name: item.name,
          value: coord.concat([stats.total]),
          intro: item.intro,
          overview: item.overview,
          id: item.id,
          stats: stats
        };
      });
    };

    const mapData = convertData(regions);

    const option = {
      backgroundColor: '#f8fafb',
      title: {
        text: '海南榴莲产业地图',
        subtext: '点击区域查看详情',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 18, fontWeight: 600 }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params) => {
          if (params.data && params.data.stats) {
            return `<strong>${params.data.name}</strong><br/>产业项目：${params.data.stats.total}个`;
          }
          return params.name;
        }
      },
      geo: {
        map: 'Hainan',
        roam: false,
        zoom: 1.2,
        center: [109.5, 18.7],
        label: {
          show: true,
          color: '#333',
          fontSize: 11,
          formatter: (params) => {
            return params.name.replace('黎族苗族自治县', '').replace('市', '');
          }
        },
        itemStyle: {
          areaColor: '#e8f5e9',
          borderColor: '#81c784',
          borderWidth: 1.5,
        },
        emphasis: {
          itemStyle: {
            areaColor: '#a5d6a7',
            shadowBlur: 10,
            shadowColor: 'rgba(0,0,0,0.3)'
          },
          label: {
            show: true,
            color: '#1b5e20',
            fontSize: 13,
            fontWeight: 600
          }
        },
        select: {
          itemStyle: {
            areaColor: '#66bb6a'
          }
        }
      },
      series: [
        {
          name: '产业分布',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: mapData,
          symbolSize: (val) => {
            const size = val[2] || 1;
            return Math.max(20, size * 8);
          },
          label: {
            show: false
          },
          itemStyle: {
            color: '#43a047',
            opacity: 0.9,
            shadowBlur: 5,
            shadowColor: 'rgba(0,0,0,0.3)'
          },
          emphasis: {
            itemStyle: {
              color: '#2e7d32',
              shadowBlur: 10
            }
          }
        }
      ]
    };

    myChart.setOption(option);

    myChart.off('click');
    myChart.on('click', (params) => {
      if (params.data && params.data.id) {
        setSelectedRegion(params.data);
      }
    });

    // 异步加载海南GeoJSON
    fetch('https://geo.datav.aliyun.com/areas_v3/bound/460000_full.json')
      .then(r => r.json())
      .then(geoJson => {
        echarts.registerMap('Hainan', geoJson);
        myChart.setOption(option);
      })
      .catch(() => {
        // 如果加载失败，使用简化坐标
      });

    window.addEventListener('resize', () => myChart.resize());
  };

  const getCategoryColor = (cat) => {
    const colors = { '种苗繁育': '#4caf50', '规模化种植': '#2196f3', '加工分选': '#ff9800', '文旅博览': '#9c27b0' };
    return colors[cat] || '#757575';
  };

  const getCategoryIcon = (cat) => {
    const icons = { '种苗繁育': '🌱', '规模化种植': '🌴', '加工分选': '🏭', '文旅博览': '🏞' };
    return icons[cat] || '📍';
  };

  if (loading) {
    return <div className="industry-loading">加载中...</div>;
  }

  return (
    <div className="industry-page">
      <div className="industry-header">
        <h1>海南榴莲产业地图</h1>
        <p>海南榴莲种植面积约4.5万亩，90%集中在三亚、保亭、乐东、万宁四大核心产区</p>
      </div>

      <div className="industry-content">
        <div className="industry-map-container" ref={mapChartRef} />

        <div className="industry-stats-bar">
          {regions.map(region => {
            const stats = getRegionStats(region.id);
            return (
              <div
                key={region.id}
                className={`stat-card ${selectedRegion?.id === region.id ? 'active' : ''}`}
                onClick={() => setSelectedRegion({ ...region, stats: stats })}
              >
                <span className="stat-name">{region.name.replace('黎族苗族自治县', '').replace('市', '')}</span>
                <span className="stat-count">{stats.total}个项目</span>
              </div>
            );
          })}
        </div>

        {selectedRegion ? (
          <div className="region-detail">
            <div className="region-detail-header">
              <h2>{selectedRegion.name}</h2>
              <button className="close-btn" onClick={() => setSelectedRegion(null)}>×</button>
            </div>

            <p className="region-intro">{selectedRegion.intro}</p>

            {selectedRegion.overview && (
              <div className="region-overview">
                <h3>产业概览</h3>
                <p>{selectedRegion.overview}</p>
              </div>
            )}

            <div className="region-industries">
              <h3>产业项目</h3>
              <div className="industry-list">
                {industryData
                  .filter(i => i.region_id === selectedRegion.id)
                  .map(item => (
                    <div key={item.id} className="industry-card">
                      <div className="industry-card-header">
                        <span className="industry-icon">{getCategoryIcon(item.category)}</span>
                        <span className="industry-category" style={{ color: getCategoryColor(item.category) }}>
                          {item.category}
                        </span>
                      </div>
                      <h4 className="industry-name">{item.name}</h4>
                      <div className="industry-info">
                        {item.position && <p><strong>位置：</strong>{item.position}</p>}
                        {item.area && <p><strong>面积：</strong>{item.area}</p>}
                        {item.capacity && <p><strong>产能：</strong>{item.capacity}</p>}
                        {item.varieties && <p><strong>品种：</strong>{item.varieties}</p>}
                        {item.brand && <p><strong>品牌：</strong>{item.brand}</p>}
                        {item.features && <p><strong>特点：</strong>{item.features}</p>}
                      </div>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="industry-link">
                          查看详情 →
                        </a>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="region-hint">
            <p>👆 点击地图上的区域查看详细产业信息</p>
            <div className="category-legend">
              <span className="legend-item"><span className="dot" style={{background:'#4caf50'}}></span>种苗繁育</span>
              <span className="legend-item"><span className="dot" style={{background:'#2196f3'}}></span>规模化种植</span>
              <span className="legend-item"><span className="dot" style={{background:'#ff9800'}}></span>加工分选</span>
              <span className="legend-item"><span className="dot" style={{background:'#9c27b0'}}></span>文旅博览</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
