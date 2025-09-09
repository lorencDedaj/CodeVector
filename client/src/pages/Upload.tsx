import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SingleFileUploader from "../components/common/SingleFileUploader";

export default function Upload() {
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const nav = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/repo/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, repoUrl }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();           
      nav(`/chat/${data.id}`);
    } catch (e:any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{display:'grid', gap:16, maxWidth:560, margin:'0 auto', padding:16}}>
      <section>
        <h2>Upload a .zip</h2>
        <SingleFileUploader onUploaded={(id)=>nav(`/chat/${id}`)} />
      </section>

      <hr />

      <section>
        <h2>Import by GitHub URL</h2>
        <form onSubmit={onSubmit} style={{display:'grid', gap:8}}>
          <label>Project name
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="My Repo" />
          </label>
          <label>GitHub URL
            <input value={repoUrl} onChange={e=>setRepoUrl(e.target.value)} placeholder="https://github.com/OWNER/REPO" />
          </label>
          <button type="submit" disabled={loading || !repoUrl}>{loading ? 'Creating…' : 'Create & Go to Chat'}</button>
          {error && <div style={{color:'crimson'}}>{error}</div>}
        </form>
      </section>
    </div>
  );
}



//add text box and submit button

//when submit button clicked console log response gotten from sending to /repo endpoint