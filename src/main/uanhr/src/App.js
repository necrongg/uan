import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!file) return alert("파일을 선택하세요.");

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUploadResult({ success: true, url: data.url });
          } else {
            setUploadResult({ success: false, error: data.error });
          }
        })
        .catch(err => setUploadResult({ success: false, error: err.message }));
  };

  return (
      <div style={{ padding: 20 }}>
        <h1>NAS 파일 업로드 테스트</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: 10 }}>업로드</button>

        {uploadResult && (
            <div style={{ marginTop: 20 }}>
              {uploadResult.success
                  ? <div>업로드 성공! <a href={uploadResult.url} target="_blank" rel="noreferrer">{uploadResult.url}</a></div>
                  : <div style={{ color: 'red' }}>업로드 실패: {uploadResult.error}</div>}
            </div>
        )}
      </div>
  );
}

export default App;
