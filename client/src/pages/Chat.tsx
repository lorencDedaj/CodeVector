import { useParams } from 'react-router-dom';
import { useState } from 'react';

type Msg = { role: 'user'|'assistant'|'error'; content: string };
type Params = { projectId?: string; repoName?: string };

// If you didn't add a Vite proxy for '/ask', switch to `${BASE}/ask`
const BASE = import.meta.env.VITE_API_URL ?? '';

export default function Chat() {
  const { projectId, repoName } = useParams<Params>();
  const jobId = projectId?.trim() ?? '';
  const repo = repoName?.trim() ?? '';
  const hasZipTarget = !!jobId;
  const hasRepoTarget = !!repo;
  const hasTarget = hasZipTarget || hasRepoTarget;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  async function askZip(question: string) {
    const res = await fetch('/api/repo/query', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ jobId, question, topK: 5 }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json() as { answer: string };
    return data.answer ?? '';
  }

  async function askRepo(question: string) {
    // If you have a proxy for '/ask', use '/ask'. Otherwise use `${BASE}/ask`.
    const endpoint = '/ask';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      // Adjust keys if your middleware expects repoUrl instead of repoName
      body: JSON.stringify({ repoName: repo, question }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json() as { result: string };
    return data.result ?? '';
  }

  async function send() {
    const question = input.trim();
    if (!question || !hasTarget) return;

    setBanner(null);
    setMsgs(m => [...m, { role: 'user', content: question }]);
    setInput('');
    setBusy(true);

    try {
      const answer = hasZipTarget
        ? await askZip(question)
        : await askRepo(question);

      setMsgs(m => [...m, { role: 'assistant', content: answer }]);
    } catch (e: any) {
      const msg = e?.message || 'Request failed';
      setMsgs(m => [...m, { role: 'error', content: msg }]);
      setBanner(`Error: ${msg}`);
      // Also log for easier debugging:
      console.error('[chat]', msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100vh'}}>
      <header style={{padding:12,borderBottom:'1px solid #eee'}}>
        {hasZipTarget ? <>Chat — jobId: <b>{jobId}</b></>
        : hasRepoTarget ? <>Chat — repo: <b>{repo}</b></>
        : <span style={{color:'crimson'}}>No target provided. Open via <code>/chat/:projectId</code> (zip) or <code>/chat/repo/:repoName</code> (clone).</span>}
      </header>

      {banner && (
        <div style={{padding:10, background:'#ffecec', color:'#a40000', borderBottom:'1px solid #f3caca'}}>
          {banner}
        </div>
      )}

      <main style={{padding:12,overflow:'auto',whiteSpace:'pre-wrap'}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{margin:'8px 0', color: m.role==='error' ? 'crimson' : 'inherit'}}>
            <b>{m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Bot' : 'Error'}:</b> {m.content}
          </div>
        ))}
      </main>

      <footer style={{display:'flex',gap:8,padding:12,borderTop:'1px solid #eee'}}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
          placeholder={hasZipTarget ? 'Ask about this uploaded .zip…' : 'Ask about this cloned repo…'}
          style={{flex:1,padding:'8px 10px'}}
        />
        <button
          onClick={()=>{ void send(); }}
          disabled={busy || !hasTarget || !input.trim()}
        >
          {busy ? 'Asking…' : 'Send'}
        </button>
      </footer>
    </div>
  );
}



// import { useParams } from 'react-router-dom';
// import { useState } from 'react';

// type Msg = { role: 'user'|'assistant'|'error'; content: string };

// export default function Chat() {
//   const { projectId: jobId = '' } = useParams(); // we navigate to /chat/:jobId after upload
//   const [msgs, setMsgs] = useState<Msg[]>([]);
//   const [input, setInput] = useState('');
//   const [busy, setBusy] = useState(false);

//   async function send() {
//     const question = input.trim();
//     if (!question || !jobId) return;

//     setMsgs(m => [...m, { role: 'user', content: question }]);
//     setInput('');
//     setBusy(true);

//     try {
//       const res = await fetch('/api/repo/query', {
//         method: 'POST',
//         headers: { 'Content-Type':'application/json' },
//         body: JSON.stringify({ jobId, question, topK: 5 }),
//       });
//       if (!res.ok) throw new Error(await res.text());
//       const { answer, sources } = await res.json();

//       // render answer (and optionally sources)
//       const withSources = sources?.length
//         ? `${answer}\n\n—\nSources:\n${sources.map((s:any)=>`${s.path} (chunk ${s.idx}) [${(s.score||0).toFixed?.(3)}]`).join('\n')}`
//         : answer;

//       setMsgs(m => [...m, { role: 'assistant', content: withSources }]);
//     } catch (e:any) {
//       setMsgs(m => [...m, { role: 'error', content: e.message || 'Query failed' }]);
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <div style={{display:'grid', gridTemplateRows:'auto 1fr auto', height:'100vh'}}>
//       <header style={{padding:12,borderBottom:'1px solid #eee'}}>
//         Chat — jobId: <b>{jobId || '—'}</b>
//       </header>

//       <main style={{padding:12,overflow:'auto',whiteSpace:'pre-wrap'}}>
//         {msgs.map((m,i)=>(
//           <div key={i} style={{margin:'8px 0', color: m.role==='error'?'crimson':'inherit'}}>
//             <b>{m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Bot' : 'Error'}:</b> {m.content}
//           </div>
//         ))}
//       </main>

//       <footer style={{display:'flex',gap:8,padding:12,borderTop:'1px solid #eee'}}>
//         <input
//           value={input}
//           onChange={e=>setInput(e.target.value)}
//           onKeyDown={e=>{ if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
//           placeholder="Ask about this repo…"
//           style={{flex:1,padding:'8px 10px'}}
//         />
//         <button onClick={send} disabled={busy || !jobId || !input.trim()}>
//           {busy ? 'Asking…' : 'Send'}
//         </button>
//       </footer>
//     </div>
//   );
// }
