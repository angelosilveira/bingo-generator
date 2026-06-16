import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Loader2, Plus, ImagePlus, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import BingoCardPreview from '../components/BingoCardPreview'
import { formatCurrency } from '../utils/currency'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = e.target.result
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ImageSlot({ index, preview, onSelect, onRemove }) {
  const ref = useRef(null)
  return (
    <div className="relative">
      <div onClick={() => !preview && ref.current?.click()}
        className={`h-28 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-colors
          ${preview ? 'border-blue-300' : 'border-dashed border-gray-200 hover:border-[#0D1F3C] hover:bg-blue-50 cursor-pointer'}`}>
        {preview
          ? <img src={preview} className="w-full h-full object-cover" alt={`Foto ${index + 1}`} />
          : <div className="flex flex-col items-center gap-1 text-gray-400">
              <ImagePlus size={22} /><span className="text-xs font-medium">Foto {index + 1}</span>
            </div>}
      </div>
      {preview && (
        <button onClick={onRemove}
          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
          <X size={12} />
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { if (e.target.files[0]) onSelect(e.target.files[0]) }} />
      {preview && (
        <button onClick={() => ref.current?.click()}
          className="mt-1 w-full text-xs text-center text-gray-400 hover:text-[#0D1F3C] transition-colors">
          Trocar foto
        </button>
      )}
    </div>
  )
}

export default function EditBingoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [totalGeradas, setTotalGeradas] = useState(0)
  const [imagePreviews, setImagePreviews] = useState([null, null, null])
  const [form, setForm] = useState({
    premio: '', contato: '', data: '', horario: '', local: '',
    valorCartela: '', quantidadeCartelas: 100, cartelajInicio: 1,
  })

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'bingos', id))
        if (!snap.exists()) { toast.error('Bingo não encontrado.'); navigate('/admin'); return }
        const d = snap.data()
        const total = d.totalCartelas || d.quantidadeCartelas || 0
        setTotalGeradas(total)
        setForm({ premio: d.premio || '', data: d.data || '', horario: d.horario || '',
          local: d.local || '', valorCartela: d.valorCartela || '',
          quantidadeCartelas: 100, cartelajInicio: total + 1 })
        if (d.premioImagens) setImagePreviews([d.premioImagens[0]||null, d.premioImagens[1]||null, d.premioImagens[2]||null])
        else if (d.premioImageBase64) setImagePreviews([d.premioImageBase64, null, null])
      } catch { toast.error('Erro ao carregar.'); navigate('/admin') }
      finally { setLoading(false) }
    }
    load()
  }, [id])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleImage = async (index, file) => {
    const b64 = await resizeImage(file)
    setImagePreviews(prev => { const n = [...prev]; n[index] = b64; return n })
  }
  const removeImage = (index) => setImagePreviews(prev => { const n = [...prev]; n[index] = null; return n })

  const cartelaFim = Number(form.cartelajInicio) + Number(form.quantidadeCartelas) - 1

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.premio || !form.data || !form.local || !form.valorCartela) { toast.error('Preencha todos os campos.'); return }
    setSubmitting(true)
    try {
      const premioImagens = imagePreviews.filter(Boolean)
      await updateDoc(doc(db, 'bingos', id), {
        ...form, premioImagens, premioImageBase64: premioImagens[0] || null,
        status: 'processing', totalCartelas: cartelaFim, updatedAt: new Date(),
      })
      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bingoId: id, ...form, premioImagens,
          premioImageBase64: premioImagens[0] || null,
          quantidadeCartelas: Number(form.quantidadeCartelas),
          cartelajInicio: Number(form.cartelajInicio) }),
      })
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).detail || 'Falha')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'), { href: url, download: `bingo-${id}-${form.cartelajInicio}-${cartelaFim}.pdf` }).click()
      URL.revokeObjectURL(url)
      toast.success(`Cartelas ${form.cartelajInicio}–${cartelaFim} geradas!`)
      navigate('/admin')
    } catch (err) { toast.error(err.message || 'Erro.') }
    finally { setSubmitting(false) }
  }

  if (loading) return <Layout><div className="flex-1 flex items-center justify-center text-gray-400">Carregando…</div></Layout>

  return (
    <Layout>
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-800">Editar Bingo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Atualize e gere mais cartelas a partir do nº <strong className="text-[#0D1F3C]">{form.cartelajInicio}</strong></p>
          </div>
          {totalGeradas > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-sm font-bold text-blue-800">{totalGeradas} cartela{totalGeradas!==1?'s':''} já gerada{totalGeradas!==1?'s':''} (1–{totalGeradas})</p>
                <p className="text-xs text-blue-600 mt-0.5">Novas cartelas a partir do <strong>{totalGeradas + 1}</strong>.</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-5">

              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎁</span> Prêmio</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nome do prêmio <span className="text-red-500">*</span></label>
                    <input type="text" value={form.premio} onChange={set('premio')} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Fotos do prêmio <span className="text-xs text-gray-400">(até 3)</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {[0,1,2].map(i => (
                        <ImageSlot key={i} index={i} preview={imagePreviews[i]}
                          onSelect={(f) => handleImage(i, f)} onRemove={() => removeImage(i)} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📅</span> Evento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data <span className="text-red-500">*</span></label>
                    <input type="date" value={form.data} onChange={set('data')} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
                    <input type="time" value={form.horario} onChange={set('horario')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Local <span className="text-red-500">*</span></label>
                    <input type="text" value={form.local} onChange={set('local')} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎟️</span> Cartelas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Valor <span className="text-red-500">*</span></label>
                    <input type="text" value={form.valorCartela} required
                      onChange={e => setForm(f => ({ ...f, valorCartela: formatCurrency(e.target.value) }))}
                      inputMode="numeric"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade a gerar</label>
                    <input type="number" value={form.quantidadeCartelas} onChange={set('quantidadeCartelas')} min={1} max={1000}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Número inicial <span className="text-red-500">*</span></label>
                    <input type="number" value={form.cartelajInicio} onChange={set('cartelajInicio')} min={1} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                    <p className="text-xs text-gray-400 mt-1">Próxima: {totalGeradas + 1}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Número final</label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 font-bold">{cartelaFim}</div>
                  </div>
                </div>
                <div className="mt-4 bg-[#0D1F3C] rounded-lg p-3 text-center">
                  <p className="text-white text-sm font-bold">
                    Será gerado: cartelas <span className="text-[#E8A000]">{form.cartelajInicio}</span> até <span className="text-[#E8A000]">{cartelaFim}</span>
                    <span className="text-gray-400 text-xs ml-2">({form.quantidadeCartelas} cartelas)</span>
                  </p>
                </div>
              </section>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base">
                {submitting
                  ? <><Loader2 size={20} className="animate-spin" /> Gerando…</>
                  : <><Plus size={20} /> Gerar cartelas {form.cartelajInicio}–{cartelaFim}</>}
              </button>
            </form>
            <div className="lg:sticky lg:top-8">
              <BingoCardPreview form={form} imagePreviews={imagePreviews} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
