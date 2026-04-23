import { useState, useEffect } from 'react';
import { Button, Progress, message, Image } from 'antd';
import { DeleteOutlined, AppstoreOutlined, PictureOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { getFileUrl } from '../utils/api';

export default function ImageUpload({
  value,
  onChange,
  accept = 'image/*',
  uploadApi,
  maxSize = 5 * 1024 * 1024 * 1024,
  hint = '支持 JPG/PNG/GIF 格式',
  sizeLabel = '5GB',
  onMediaSelect,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    // 将相对路径转换为完整URL
    if (value) {
      setPreview(getFileUrl(value));
    } else {
      setPreview('');
    }
  }, [value]);

  const handleUpload = async (file) => {
    if (file.size > maxSize) {
      message.error(`文件大小不能超过${sizeLabel}`);
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      const res = await uploadApi(file, setProgress);
      // 上传成功后，res.url 是相对路径，存储相对路径但预览用完整URL
      setPreview(getFileUrl(res.url));
      onChange?.(res.url);
      message.success('上传成功');
    } catch (e) {
      message.error('上传失败: ' + e.message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange?.('');
  };

  const isVideo = accept === 'video/*';
  const inputId = `upload-${accept.replace('/*', '')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 已上传预览 */}
      {preview && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {isVideo ? (
            <video
              src={preview}
              style={{ width: 200, height: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid #e8e8e8' }}
              controls
            />
          ) : (
            <Image
              src={preview}
              alt="预览"
              width={200}
              height={120}
              style={{ borderRadius: 8, objectFit: 'cover', border: '1px solid #e8e8e8' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          )}
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={handleRemove}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              background: 'rgba(255,255,255,0.9)',
              borderRadius: 4,
            }}
          >
            移除
          </Button>
        </div>
      )}

      {/* 上传进度 */}
      {uploading && (
        <Progress percent={progress} size="small" style={{ marginBottom: 8 }} />
      )}

      {/* 上传按钮组 */}
      <div style={{ display: 'flex', gap: 12 }}>

        {/* 媒体库按钮 */}
        {onMediaSelect && (
          <Button
            icon={<AppstoreOutlined />}
            onClick={onMediaSelect}
            style={{
              height: 72,
              padding: '0 20px',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 500 }}>媒体库</span>
            <span style={{ fontSize: 12, color: '#999' }}>选择已有文件</span>
          </Button>
        )}
      </div>
    </div>
  );
}