import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Modal, Image, message, Popconfirm, Tag, Space, Spin, Progress, Input, Tabs, Pagination } from 'antd';
import { PictureOutlined, VideoCameraOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, CheckCircleFilled, EyeOutlined, FileImageOutlined } from '@ant-design/icons';
import { adminApi, uploadApi, getFileUrl } from '../utils/api';

const PAGE_SIZE = 20;

export default function MediaLibrary({ visible = false, onSelect, selectMode = false }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState(null);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadTotal, setUploadTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('images');
  const [renamingItem, setRenamingItem] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback((pageNum = 1) => {
    setLoading(true);
    const type = activeTab === 'images' ? 'image' : 'video';
    adminApi.getMedia({ type, page: pageNum, pageSize: PAGE_SIZE }).then(res => {
      setData(res.list || []);
      setTotal(res.total || 0);
      setPage(pageNum);
      setLoading(false);
    }).catch(e => {
      message.error('加载失败: ' + e.message);
      setLoading(false);
    });
  }, [activeTab]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = (pageNum) => {
    setPage(pageNum);
    fetchData(pageNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpload = async (files, type) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;
    for (const file of fileList) {
      if (file.size > 5 * 1024 * 1024 * 1024) {
        message.error('文件超过5GB限制');
        return;
      }
    }
    setUploading(true);
    setUploadType(type);
    setUploadTotal(fileList.length);
    setUploadProgress(0);
    setUploadQueue(fileList);
    const isImage = type === 'image';
    const successFiles = [], failFiles = [];
    for (let i = 0; i < fileList.length; i++) {
      setUploadQueue(prev => prev.slice(1));
      try {
        const api = isImage ? uploadApi.uploadImage : uploadApi.uploadVideo;
        await api(fileList[i], (pct) => {
          const base = Math.floor((i / fileList.length) * 100);
          const portion = Math.floor((pct / 100) * (100 / fileList.length));
          setUploadProgress(base + portion);
        });
        successFiles.push(fileList[i].name);
      } catch (e) { failFiles.push(fileList[i].name); }
      setUploadProgress(Math.floor(((i + 1) / fileList.length) * 100));
    }
    setUploading(false);
    setUploadProgress(0);
    setUploadType(null);
    setUploadQueue([]);
    setUploadTotal(0);
    if (successFiles.length > 0) {
      message.success('上传成功 ' + successFiles.length + ' 个文件');
      fetchData(1);
    }
    if (failFiles.length > 0) {
      message.error('失败 ' + failFiles.length + ' 个: ' + failFiles.join(', '));
    }
  };

  const handleDelete = async (item) => {
    try {
      await adminApi.deleteMedia({ id: item.id });
      message.success('删除成功');
      fetchData(page);
    } catch (e) { message.error('删除失败: ' + e.message); }
  };

  const handleRename = (item) => {
    setRenamingItem(item);
    setRenameValue(item.filename.substring(0, item.filename.lastIndexOf('.')));
  };

  const handleRenameConfirm = async () => {
    if (!renamingItem || !renameValue.trim()) return;
    const ext = renamingItem.filename.substring(renamingItem.filename.lastIndexOf('.'));
    const newFilename = renameValue.trim() + ext;
    if (newFilename === renamingItem.filename) { setRenamingItem(null); return; }
    try {
      await adminApi.renameMedia(renamingItem.url, newFilename);
      message.success('重命名成功');
      setRenamingItem(null);
      fetchData(page);
    } catch (e) { message.error(e.message || '重命名失败'); }
  };

  const handleSelect = (item) => {
    if (!selectMode) return;
    setSelectedKeys(prev => prev.includes(item.id) ? [] : [item.id]);
  };

  const handleConfirmSelect = () => {
    if (selectedKeys.length > 0 && onSelect) {
      const item = data.find(d => d.id === selectedKeys[0]);
      onSelect(item.url);
    }
  };

  const handleClose = () => {
    setSelectedKeys([]);
    onSelect && onSelect(null);
  };

  const openPreview = (item) => { setPreviewItem(item); setPreviewVisible(true); };

  const renderImageCard = useCallback((item) => {
    const isSelected = selectedKeys.includes(item.id);
    return (
      <div key={item.id} onClick={() => handleSelect(item)}
        style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: selectMode ? 'pointer' : 'default', border: isSelected ? '3px solid #1B5E20' : '3px solid transparent', transition: 'all 0.3s', background: '#fafafa' }}>
        <div style={{ position: 'relative', paddingTop: '75%', background: '#f0f0f0' }}>
          <img src={getFileUrl(item.url)} alt={item.filename} loading="lazy"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onError={(e) => { e.target.style.opacity = '0'; e.target.parentElement.style.background = '#e8e8e8'; }} />
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '2px 8px', color: '#fff', fontSize: 11 }}>
            {item.sizeFormatted}
          </div>
        </div>
        {isSelected && <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, zIndex: 2 }}><CheckCircleFilled /></div>}
        <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 12, color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{item.filename}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); openPreview(item); }} style={{ color: '#666' }} />
            {!selectMode && (
              <Space size={2}>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleRename(item); }} style={{ color: '#666' }} />
                <Popconfirm title="确认删除" description="确定要删除此文件吗？" onConfirm={() => handleDelete(item)} okText="确认" cancelText="取消" placement="topRight">
                  <Button type="text" size="small" icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} style={{ color: '#ff4d4f' }} danger />
                </Popconfirm>
              </Space>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedKeys, selectMode, page]);

  const renderVideoCard = useCallback((item) => {
    const isSelected = selectedKeys.includes(item.id);
    return (
      <div key={item.id} onClick={() => handleSelect(item)}
        style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: selectMode ? 'pointer' : 'default', border: isSelected ? '3px solid #1B5E20' : '3px solid transparent', transition: 'all 0.3s', background: '#1a1a1a' }}>
        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
          <video src={getFileUrl(item.url)} preload="metadata" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VideoCameraOutlined style={{ fontSize: 22, color: '#333' }} />
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.4)', borderRadius: 4, padding: '2px 8px', color: '#fff', fontSize: 11 }}>
            {item.sizeFormatted}
          </div>
        </div>
        {isSelected && <div style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#1B5E20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, zIndex: 2 }}><CheckCircleFilled /></div>}
        <div style={{ padding: '8px', borderTop: '1px solid #333' }}>
          <div style={{ fontSize: 12, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 6 }}>{item.filename}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); openPreview(item); }} style={{ color: '#fff' }} />
            {!selectMode && (
              <Space size={2}>
                <Button type="text" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleRename(item); }} style={{ color: '#fff' }} />
                <Popconfirm title="确认删除" description="确定要删除此文件吗？" onConfirm={() => handleDelete(item)} okText="确认" cancelText="取消" placement="topRight">
                  <Button type="text" size="small" icon={<DeleteOutlined />} onClick={e => e.stopPropagation()} style={{ color: '#ff6b6b' }} danger />
                </Popconfirm>
              </Space>
            )}
          </div>
        </div>
      </div>
    );
  }, [selectedKeys, selectMode, page]);

  const UploadButton = ({ type }) => {
    const isImage = type === 'image';
    const inputRef = useRef(null);
    const handleClick = () => inputRef.current?.click();
    const handleFileChange = (e) => {
      if (e.target.files?.length > 0) {
        handleUpload(e.target.files, type);
        e.target.value = '';
      }
    };
    return (
      <>
        <input ref={inputRef} type="file" accept={isImage ? 'image/*' : 'video/*'} multiple style={{ display: 'none' }} onChange={handleFileChange} />
        <Button icon={isImage ? <PictureOutlined /> : <VideoCameraOutlined />} onClick={handleClick} loading={uploading && uploadType === type} style={{ borderRadius: 8 }}>
          {isImage ? '上传图片' : '上传视频'}
        </Button>
      </>
    );
  };

  const images = data.filter(item => item.type === 'image');
  const videos = data.filter(item => item.type === 'video');

  const tabItems = [
    {
      key: 'images',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><FileImageOutlined style={{ fontSize: 15 }} /> 图片</span>,
      children: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, padding: 20 }}>
            {!loading && images.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
                <PictureOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16, display: 'block' }} />
                <div style={{ color: '#999', fontSize: 14 }}>暂无图片</div>
              </div>
            ) : images.map(renderImageCard)}
          </div>
          {!loading && total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </div>
      )
    },
    {
      key: 'videos',
      label: <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}><VideoCameraOutlined style={{ fontSize: 15 }} /> 视频</span>,
      children: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, padding: 20 }}>
            {!loading && videos.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center' }}>
                <VideoCameraOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16, display: 'block' }} />
                <div style={{ color: '#999', fontSize: 14 }}>暂无视频</div>
              </div>
            ) : videos.map(renderVideoCard)}
          </div>
          {!loading && total > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <Pagination
                current={page}
                pageSize={PAGE_SIZE}
                total={total}
                onChange={handlePageChange}
                showSizeChanger={false}
                size="small"
              />
            </div>
          )}
        </div>
      )
    },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
  };

  const uploadProgressCard = uploading && (
    <Card style={{ borderRadius: 12, marginBottom: 16, background: '#f0f9f0', border: '1px solid #c8e6c9' }} styles={{ body: { padding: 16 } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: uploadType === 'image' ? '#e8f5e9' : '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {uploadType === 'image' ? <PictureOutlined style={{ fontSize: 22, color: '#2e7d32' }} /> : <VideoCameraOutlined style={{ fontSize: 22, color: '#1565c0' }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#333', marginBottom: 6, fontWeight: 500 }}>
            正在上传{uploadType === 'image' ? '图片' : '视频'}{uploadTotal > 1 && ' (' + (uploadTotal - uploadQueue.length) + '/' + uploadTotal + ')'}
          </div>
          <Progress percent={uploadProgress} size="small" strokeColor="#1B5E20" railColor="#c8e6c9"
            showInfo format={(p) => p + '%' + (uploadTotal > 1 ? ' · ' + (uploadTotal - uploadQueue.length) + '/' + uploadTotal : '')} />
        </div>
      </div>
    </Card>
  );

  const mainContent = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4, color: '#1B5E20', fontWeight: 600 }}>媒体库</h1>
          <p style={{ color: '#666', margin: 0 }}>管理所有图片和视频素材 {total > 0 && <span style={{ color: '#999', fontSize: 13 }}>（共 {total} 个）</span>}</p>
        </div>
        <Space wrap>
          <UploadButton type="image" />
          <UploadButton type="video" />
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)} loading={loading} style={{ borderRadius: 8 }}>刷新</Button>
        </Space>
      </div>
      {uploadProgressCard}
      <Card style={{ borderRadius: 16 }} styles={{ body: { padding: 0 } }}>
        <Spin spinning={loading} description="加载中...">
          <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} style={{ padding: '0 4px' }} />
        </Spin>
      </Card>
    </>
  );

  // 非选择模式：直接渲染页面
  if (!selectMode) {
    return (
      <div style={{ padding: '0 24px' }}>
        {mainContent}
        {/* 重命名弹窗 */}
        <Modal title="重命名文件" open={!!renamingItem} onCancel={() => setRenamingItem(null)}
          footer={<div style={{ display: 'flex', gap: 12 }}>
            <Button onClick={() => setRenamingItem(null)} style={{ borderRadius: 8 }}>取消</Button>
            <Button type="primary" onClick={handleRenameConfirm} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
          </div>}>
          {renamingItem && <div style={{ padding: '16px 0' }}>
            <div style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>当前文件名：{renamingItem.filename}</div>
            <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} onPressEnter={handleRenameConfirm}
              placeholder="请输入新名称（不含扩展名）" status={!renameValue.trim() ? 'error' : ''} />
          </div>}
        </Modal>
        {/* 预览弹窗 */}
        <Modal
          title={<span style={{ fontSize: 16, fontWeight: 600, color: '#1B5E20' }}>
            {previewItem?.type === 'video' ? '视频预览' : '图片预览'}
          </span>}
          open={previewVisible} onCancel={() => setPreviewVisible(false)}
          styles={{ body: { padding: 0, overflow: 'hidden' } }} footer={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tag color="processing" style={{ margin: 0, borderRadius: 6 }}>{previewItem?.sizeFormatted}</Tag>
            <Button type="primary" onClick={() => setPreviewVisible(false)} style={{ borderRadius: 8 }}>关闭</Button>
          </div>}
          width={previewItem?.type === 'video' ? 850 : 900}
          styles={{ body: { padding: 0 } }} style={{ top: 40 }}>
          <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {previewItem?.type === 'image'
              ? <Image src={getFileUrl(previewItem?.url)} alt={previewItem?.filename} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} preview={false} />
              : <video src={getFileUrl(previewItem?.url)} controls autoPlay style={{ width: '100%', maxHeight: '70vh', background: '#000' }} />}
          </div>
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#333', fontSize: 13, fontWeight: 500 }}>{previewItem?.filename}</span>
            <span style={{ color: '#999', fontSize: 12 }}>{previewItem?.type === 'video' ? '视频' : '图片'}</span>
          </div>
        </Modal>
      </div>
    );
  }

  // 选择模式：全屏覆盖形式（使用 custom-modal-overlay 样式）
  return (
    <>
      <div className="custom-modal-overlay media-selector-overlay" style={{ display: visible ? 'flex' : 'none', flexDirection: 'column' }}>
        <div className="custom-modal-container">
          {/* 内容区域 */}
          <div className="custom-modal-body" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
            {uploadProgressCard}
            <Spin spinning={loading} description="加载中..." style={{ flex: 1 }}>
              <Tabs activeKey={activeTab} onChange={handleTabChange} items={tabItems} style={{ padding: '0 24px', height: '100%' }} />
            </Spin>
          </div>
          {/* 底部栏 */}
          <div className="custom-modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space wrap>
              <UploadButton type="image" />
              <UploadButton type="video" />
              <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)} loading={loading} style={{ borderRadius: 8 }}>刷新</Button>
            </Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#999', fontSize: 13 }}>已选择 {selectedKeys.length} 个文件 {total > 0 && `（共 ${total} 个）`}</span>
              <Space>
                <Button onClick={handleClose} style={{ borderRadius: 8 }}>取消</Button>
                <Button type="primary" onClick={handleConfirmSelect} disabled={selectedKeys.length === 0} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认选择</Button>
              </Space>
            </div>
          </div>
        </div>
      </div>
      <Modal title="重命名文件" open={!!renamingItem} onCancel={() => setRenamingItem(null)}
        footer={<div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={() => setRenamingItem(null)} style={{ borderRadius: 8 }}>取消</Button>
          <Button type="primary" onClick={handleRenameConfirm} style={{ borderRadius: 8, background: '#1B5E20', borderColor: '#1B5E20' }}>确认</Button>
        </div>}>
        {renamingItem && <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 8, color: '#666', fontSize: 13 }}>当前文件名：{renamingItem.filename}</div>
          <Input value={renameValue} onChange={e => setRenameValue(e.target.value)} onPressEnter={handleRenameConfirm}
            placeholder="请输入新名称（不含扩展名）" status={!renameValue.trim() ? 'error' : ''} />
        </div>}
      </Modal>
      {/* 预览弹窗 */}
      <Modal
        title={<span style={{ fontSize: 16, fontWeight: 600, color: '#1B5E20' }}>
          {previewItem?.type === 'video' ? '视频预览' : '图片预览'}
        </span>}
        open={previewVisible} onCancel={() => setPreviewVisible(false)}
        styles={{ body: { padding: 0, overflow: 'hidden' } }} footer={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tag color="processing" style={{ margin: 0, borderRadius: 6 }}>{previewItem?.sizeFormatted}</Tag>
            <Button type="primary" onClick={() => setPreviewVisible(false)} style={{ borderRadius: 8 }}>关闭</Button>
          </div>}
        width={previewItem?.type === 'video' ? 850 : 900}
        styles={{ body: { padding: 0 } }} style={{ top: 40 }}>
        <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewItem?.type === 'image'
            ? <Image src={getFileUrl(previewItem?.url)} alt={previewItem?.filename} style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }} preview={false} />
            : <video src={getFileUrl(previewItem?.url)} controls autoPlay style={{ width: '100%', maxHeight: '70vh', background: '#000' }} />}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#333', fontSize: 13, fontWeight: 500 }}>{previewItem?.filename}</span>
          <span style={{ color: '#999', fontSize: 12 }}>{previewItem?.type === 'video' ? '视频' : '图片'}</span>
        </div>
      </Modal>
    </>
  );
}
