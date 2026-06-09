import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { ArrowLeft, Upload, ImageIcon, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Converte o arquivo de imagem para Base64 e redimensiona para max 600px
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

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida.')
      return
    }
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
      // 1. Converte imagem para Base64 (redimensionada, sem Storage)
      let premioImageBase64 = null
      if (imageFile) {
        premioImageBase64 = await imageFileToBase64(imageFile)
      }

      // 2. Salva o registro no Firestore com status "processing"
      const docRef = await addDoc(collection(db, 'bingos'), {
        ...form,
        quantidadeCartelas: Number(form.quantidadeCartelas),
        premioImageBase64,
        status: 'processing',
        pdfUrl: null,
        createdAt: serverTimestamp(),
      })

      toast.success('Gerando cartelas, aguarde…')

      // 3. Dispara a geração do PDF no backend
      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bingoId: docRef.id,
          ...form,
          quantidadeCartelas: Number(form.quantidadeCartelas),
          premioImageBase64,
        }),
      })

      if (!res.ok) throw new Error('Falha ao gerar PDF')

      toast.success('PDF gerado com sucesso!')
      navigate('/')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar cartelas. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a3a6b] shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-white font-black text-xl">Novo Bingo</h1>
            <p className="text-blue-300 text-xs">Configure e gere as cartelas</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Prêmio */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg">🎁</span> Prêmio
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Descrição do prêmio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.premio}
                  onChange={set('premio')}
                  placeholder="Ex: Smart TV 55'' Samsung"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  required
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Imagem do prêmio
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#1a3a6b] hover:bg-blue-50 transition-colors"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto rounded-lg object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon size={32} />
                      <span className="text-sm">Clique para selecionar imagem</span>
                      <span className="text-xs">PNG, JPG, WebP</span>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </div>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null) }}
                    className="text-xs text-red-500 mt-1 hover:underline"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Evento */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg">📅</span> Evento
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Data <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.data}
                  onChange={set('data')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
                <input
                  type="time"
                  value={form.horario}
                  onChange={set('horario')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Local <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.local}
                  onChange={set('local')}
                  placeholder="Ex: Clube Recreativo Central"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  required
                />
              </div>
            </div>
          </section>

          {/* Cartelas */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-lg">🎟️</span> Cartelas
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Valor da cartela <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.valorCartela}
                  onChange={set('valorCartela')}
                  placeholder="Ex: R$ 5,00"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Quantidade de cartelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.quantidadeCartelas}
                  onChange={set('quantidadeCartelas')}
                  min={1}
                  max={1000}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Máximo: 1.000 cartelas</p>
              </div>
            </div>
          </section>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1a3a6b] hover:bg-[#0f2347] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gerando cartelas…
              </>
            ) : (
              <>
                <Upload size={20} />
                Gerar {form.quantidadeCartelas || '?'} cartelas em PDF
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
