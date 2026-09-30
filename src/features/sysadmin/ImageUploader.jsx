import { useState } from 'react';
import { uploadFile } from '../../services/api.js';

export default function ImageUploader() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
    } else {
      setError('请选择有效的图片文件');
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('请先选择图片');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadFile(selectedFile, 'diagnosis');
      const resData = response.data;
      if (resData.success) {
        setResult(resData.data);
      } else {
        setError(resData.error?.message || '上传失败');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('未登录或登录已过期，请重新登录');
      } else {
        setError(err.response?.data?.error?.message || err.response?.data?.message || '网络错误: ' + err.message);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="upload-container">
      <h2 className="upload-title">图片上传测试</h2>
      
      <div className="upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        
        {selectedFile && (
          <div className="file-preview">
            <p className="file-name">已选择: {selectedFile.name}</p>
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="预览" 
              className="preview-image"
            />
            <p className="file-size">大小: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}
      </div>

      <button 
        onClick={handleUpload} 
        disabled={!selectedFile || uploading}
        className="upload-btn"
      >
        {uploading ? (
          <span className="btn-loading">
            <span className="spinner"></span>
            上传中...
          </span>
        ) : (
          '上传图片'
        )}
      </button>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          {error}
        </div>
      )}

      {result && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          <p>上传成功！</p>
          <div className="result-details">
            <p>文件URL: {result.url || result.fileUrl || '无'}</p>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}

      <div className="api-info">
        <h3>接口信息</h3>
        <p><strong>请求方式:</strong> POST</p>
        <p><strong>接口地址:</strong> /api/v1/files?bizType=diagnosis</p>
        <p><strong>Content-Type:</strong> multipart/form-data</p>
        <p><strong>参数:</strong></p>
        <ul>
          <li>file: File (图片文件，form-data)</li>
          <li>bizType: Text (query 参数)</li>
        </ul>
      </div>
    </div>
  );
}