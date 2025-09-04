*** Added by Victoria
This is the basic frontend file structure. 
client/
├─ index.html
├─ package.json
├─ tsconfig.json
├─ vite.config.ts                      
├─ .env.development                    
└─ src/
   ├─ main.tsx
   ├─ App.tsx
   ├─ router.tsx                       
   ├─ styles/
   │  └─ globals.css
   ├─ types/
   │  └─ api.ts                        
   ├─ lib/
   │  ├─ api.ts                        
   │  └─ validators.ts                 
   ├─ api/                             
   │  ├─ projects.ts                   
   │  └─ chunks.ts                     
   ├─ store/                           
   │  ├─ useProjectStore.ts            
   │  └─ useUIStore.ts                 
   ├─ pages/
   │  ├─ ProjectCreatePage.tsx
   │  ├─ IngestStatusPage.tsx
   │  └─ ChunksPage.tsx
   ├─ components/
   │  ├─ layout/AppShell.tsx           
   │  ├─ forms/ProjectForm.tsx
   │  ├─ status/StatusBadge.tsx
   │  ├─ tables/ChunksTable.tsx
   │  └─ common/{Spinner.tsx, Empty.tsx}
   └─ test/                            
      ├─ setupTests.ts
      └─ ProjectCreatePage.test.tsx