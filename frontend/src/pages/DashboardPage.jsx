import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../services/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, LogOut, Download, Calendar, MapPin, DollarSign, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [bingos, setBingos] = useState([])
  const [loading, setLoading] = useState(true)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
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
    fetchBingos()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleDownload = (pdfBase64, numero) => {
    const byteChars = atob(pdfBase64)
    const byteArr = new Uint8Array(byteChars.length)
    for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i)
    const blob = new Blob([byteArr], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bingo-${numero}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a6b] shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎱</span>
            <div>
              <h1 className="text-white font-black text-xl">Bingo Generator</h1>
              <p className="text-blue-300 text-xs">Painel Admin</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/novo')}
              className="flex items-center gap-2 bg-[#f5a623] hover:bg-[#e09510] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Novo Bingo
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-2 rounded-lg transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Bingos Gerados</h2>
          <span className="text-sm text-gray-500">{bingos.length} registros</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Carregando…</div>
        ) : bingos.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl">🎱</span>
            <p className="text-gray-500 mt-4">Nenhum bingo gerado ainda.</p>
            <button
              onClick={() => navigate('/novo')}
              className="mt-4 bg-[#1a3a6b] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#0f2347] transition-colors"
            >
              Criar primeiro bingo
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bingos.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-5">
                {/* Prize image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-blue-50 flex-shrink-0">
                  {b.premioImageUrl ? (
                    <img src={b.premioImageUrl} alt={b.premio} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{b.premio || 'Prêmio'}</h3>
                  <div className="flex flex-wrap gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar size={12} />
                      {b.data} {b.horario && `às ${b.horario}`}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin size={12} />
                      {b.local}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <DollarSign size={12} />
                      {b.valorCartela}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Ticket size={12} />
                      {b.quantidadeCartelas} cartelas
                    </span>
                  </div>
                </div>

                {/* Status + Download */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {b.status === 'processing' ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-medium">
                      Gerando…
                    </span>
                  ) : b.pdfBase64 ? (
                    <button
                      onClick={() => handleDownload(b.pdfBase64, b.id)}
                      className="flex items-center gap-2 bg-[#1a3a6b] hover:bg-[#0f2347] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                    >
                      <Download size={15} />
                      PDF
                    </button>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full font-medium">
                      Erro
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
