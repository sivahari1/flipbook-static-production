// Demo storage for uploaded documents when database is not configured
interface DemoDocument {
  id: string
  title: string
  description?: string
  pageCount: number
  createdAt: string
  fileName: string
  fileSize: number
  storageKey: string
  owner: { email: string; role: string }
  shareLinks: any[]
  _count: { viewAudits: number; shareLinks: number }
  hasPassphrase: boolean
  viewAudits?: any[]
}

class DemoDocumentStorage {
  private storageKey = 'flipbook-demo-documents'

  // Get all demo documents from localStorage (client-side) or memory (server-side)
  getDocuments(): DemoDocument[] {
    if (typeof window !== 'undefined') {
      // Client-side: use localStorage
      try {
        const stored = localStorage.getItem(this.storageKey)
        return stored ? JSON.parse(stored) : []
      } catch {
        return []
      }
    } else {
      // Server-side: return empty array (documents are stored client-side)
      return []
    }
  }

  // Add a new document
  addDocument(document: DemoDocument): void {
    if (typeof window !== 'undefined') {
      const documents = this.getDocuments()
      documents.unshift(document) // Add to beginning
      localStorage.setItem(this.storageKey, JSON.stringify(documents))
    }
  }

  // Remove a document
  removeDocument(id: string): void {
    if (typeof window !== 'undefined') {
      const documents = this.getDocuments().filter(doc => doc.id !== id)
      localStorage.setItem(this.storageKey, JSON.stringify(documents))
    }
  }

  // Get a specific document
  getDocument(id: string): DemoDocument | null {
    const documents = this.getDocuments()
    return documents.find(doc => doc.id === id) || null
  }

  // Clear all documents
  clearDocuments(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey)
    }
  }
}

export const demoStorage = new DemoDocumentStorage()

// Default demo documents
export const getDefaultDemoDocuments = (): DemoDocument[] => [
  {
    id: 'demo-sample-1',
    title: 'Sample Document 1',
    description: 'This is a demo document for testing purposes',
    pageCount: 5,
    createdAt: new Date().toISOString(),
    fileName: 'sample-document-1.pdf',
    fileSize: 245760,
    storageKey: 'demo/demo-sample-1.pdf',
    owner: { email: 'demo@example.com', role: 'CREATOR' },
    shareLinks: [],
    _count: { viewAudits: 15, shareLinks: 0 },
    hasPassphrase: false,
    viewAudits: Array(15).fill(null).map((_, i) => ({ id: i, viewedAt: new Date() }))
  },
  {
    id: 'demo-sample-2',
    title: 'Sample Document 2',
    description: 'Another demo document',
    pageCount: 8,
    createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    fileName: 'sample-document-2.pdf',
    fileSize: 512000,
    storageKey: 'demo/demo-sample-2.pdf',
    owner: { email: 'demo@example.com', role: 'CREATOR' },
    shareLinks: [],
    _count: { viewAudits: 8, shareLinks: 0 },
    hasPassphrase: false,
    viewAudits: Array(8).fill(null).map((_, i) => ({ id: i, viewedAt: new Date() }))
  }
]