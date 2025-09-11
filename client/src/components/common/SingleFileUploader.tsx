import React, { useRef, useState } from 'react';

export default function SingleFileUploader({ onUploaded }: { onUploaded?: (id: string) => void }) {
  const [file, setFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const abortRef = useRef<AbortController|null>(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    const fd = new FormData();
    fd.append('repoZip', file);
    // fd.append('zip', file);

    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/repo/upload-local', { method:'POST', body: fd, signal: abortRef.current.signal });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const jobId = data.jobId;
    //   const id = data.projectId ?? data.repoId ?? data.id;
      if (onUploaded && jobId) onUploaded(jobId);
    } catch (e:any) {
      if (e.name !== 'AbortError') setError(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'grid', gap:8}}>
      <input type="file" accept=".zip" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      {error && <div style={{color:'crimson'}}>{error}</div>}
      <button onClick={handleUpload} disabled={!file || loading}>{loading ? 'Uploading…' : 'Upload .zip'}</button>
    </div>
  );
}
