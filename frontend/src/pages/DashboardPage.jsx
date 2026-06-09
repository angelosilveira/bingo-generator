import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Plus, Download, Calendar, MapPin, DollarSign, Ticket, Trash2, Pencil } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function DashboardPage() {
  const [bingos, setBingos] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  const fetchBingos = async () => {
    try {
      const q = query(collection(db, 'bingos'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setBingos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch {
      toast.error('Erro ao carregar bingos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBingos() }, [])

  const handleDownload = async (id) => {
    toast.loading('Gerando PDF…', { id: 'pdf' })
    try {
      const bingo = bingos.find(b => b.id === id)
      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bingoId: id, ...bingo }),
      })
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bingo-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Download concluído!', { id: 'pdf' })
    } catch {
      toast.error('Erro ao baixar PDF.', { id: 'pdf' })
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deletar este bingo? Esta ação não pode ser desfeita.')) return
    setDeletingId(id)
    try {
      await deleteDoc(doc(db, 'bingos', id))
      setBingos(prev => prev.filter(b => b.id !== id))
      toast.success('Bingo deletado.')
    } catch {
      toast.error('Erro ao deletar.')
    } finally {
      setDeletingId(null)
    }
  }

  const statusBadge = (b) => {
    if (b.status === 'processing') return (
      <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">Gerando…</span>
    )
    if (b.status === 'done') return (
      <button onClick={() => handleDownload(b.id)}
        className="flex items-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
        <Download size={15} /> PDF
      </button>
    )
    return <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">Erro</span>
  }

  return (
    <Layout>
      <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Bingos Gerados</h1>
            <p className="text-sm text-gray-500 mt-0.5">{bingos.length} registros</p>
          </div>
          <button onClick={() => navigate('/novo')}
            className="flex items-center gap-2 bg-[#E8A000] hover:bg-[#d09200] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors">
            <Plus size={16} /> Novo Bingo
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando…</div>
        ) : bingos.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🎱</span>
            <p className="text-gray-500 mt-4">Nenhum bingo gerado ainda.</p>
            <button onClick={() => navigate('/novo')}
              className="mt-4 bg-[#0D1F3C] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#162E58] transition-colors">
              Criar primeiro bingo
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {bingos.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0 flex items-center justify-center text-2xl">
                  {b.premioImageBase64
                    ? <img src={b.premioImageBase64} alt={b.premio} className="w-full h-full object-cover" />
                    : '🎁'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{b.premio || 'Prêmio'}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar size={12} />{b.data} {b.horario && `às ${b.horario}`}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} />{b.local}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><DollarSign size={12} />{b.valorCartela}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-500"><Ticket size={12} />{b.quantidadeCartelas} cartelas</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusBadge(b)}
                  <button onClick={() => navigate(`/editar/${b.id}`)}
                    className="p-2 text-gray-400 hover:text-[#0D1F3C] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar / Gerar mais cartelas">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    title="Deletar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </Layout>
  )
}
