import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Upload, Loader2, ImageIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import BingoCardPreview from '../components/BingoCardPreview'
import { formatCurrency } from '../utils/currency'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

function imageFileToBase64(file, maxSize = 600) {
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

export default function NewBingoPage() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [submitting, setSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [form, setForm] = useState({
    premio: '',
    data: '',
    horario: '',
    local: '',
    valorCartela: '',
    quantidadeCartelas: 100,
  })

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.premio || !form.data || !form.local || !form.valorCartela) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setSubmitting(true)
    try {
      let premioImageBase64 = null
      if (imageFile) premioImageBase64 = await imageFileToBase64(imageFile)

      const docRef = await addDoc(collection(db, 'bingos'), {
        ...form,
        premioImageBase64,
        quantidadeCartelas: Number(form.quantidadeCartelas),
        status: 'processing',
        createdAt: serverTimestamp(),
      })

      toast.success('Gerando cartelas, aguarde…')

      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bingoId: docRef.id,
          ...form,
          premioImageBase64,
          quantidadeCartelas: Number(form.quantidadeCartelas),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.detail || 'Falha ao gerar PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bingo-${docRef.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`${form.quantidadeCartelas} cartelas geradas!`)
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Erro ao gerar cartelas.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-800">Novo Bingo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure e visualize antes de gerar as cartelas</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Prêmio */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>🎁</span> Prêmio
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nome do prêmio <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={form.premio} onChange={set('premio')}
                      placeholder="Ex: Smart TV 55'' Samsung"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Imagem do prêmio</label>
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#0D1F3C] hover:bg-blue-50 transition-colors">
                      {imagePreview
                        ? <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                        : <div className="flex flex-col items-center gap-2 text-gray-400">
                            <ImageIcon size={28} />
                            <span className="text-sm">Clique para enviar uma foto</span>
                          </div>}
                      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Evento */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📅</span> Evento</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Data <span className="text-red-500">*</span></label>
                    <input type="date" value={form.data} onChange={set('data')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
                    <input type="time" value={form.horario} onChange={set('horario')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Local <span className="text-red-500">*</span></label>
                    <input type="text" value={form.local} onChange={set('local')}
                      placeholder="Ex: Clube Recreativo Central"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                </div>
              </section>

              {/* Cartelas */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎟️</span> Cartelas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Valor <span className="text-red-500">*</span></label>
                    <input type="text" value={form.valorCartela}
                      onChange={e => setForm(f => ({ ...f, valorCartela: formatCurrency(e.target.value) }))}
                      inputMode="numeric" placeholder="Ex: R$ 5,00"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade <span className="text-red-500">*</span></label>
                    <input type="number" value={form.quantidadeCartelas} onChange={set('quantidadeCartelas')}
                      min={1} max={1000}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                    <p className="text-xs text-gray-400 mt-1">Máximo: 1.000</p>
                  </div>
                </div>
              </section>

              <button type="submit" disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base">
                {submitting
                  ? <><Loader2 size={20} className="animate-spin" /> Gerando {form.quantidadeCartelas} cartelas…</>
                  : <><Upload size={20} /> Gerar {form.quantidadeCartelas || '?'} cartelas em PDF</>}
              </button>
            </form>

            {/* Preview */}
            <div className="lg:sticky lg:top-8">
              <BingoCardPreview form={form} imagePreview={imagePreview} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
