import './App.css';
import Upload from './pages/Upload';
import SingleFileUploader from './components/common/SingleFileUploader';

export default function App() {
  return (
    <main className="app">
      <section>
        <h1>Upload a Repo</h1>
        <Upload />
      </section>

      <section>
        <h2>Single File Uploader</h2>
        <SingleFileUploader />
      </section>
    </main>
  );
}