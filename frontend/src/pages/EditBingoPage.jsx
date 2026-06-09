import { useState, useRef, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Upload, ImageIcon, Loader2, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import BingoCardPreview from '../components/BingoCardPreview'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

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

export default function EditBingoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(true)
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
    cartelajInicio: 1,
  })

  const [totalGeradas, setTotalGeradas] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'bingos', id))
        if (!snap.exists()) { toast.error('Bingo não encontrado.'); navigate('/'); return }
        const d = snap.data()
        setForm({
          premio: d.premio || '',
          data: d.data || '',
          horario: d.horario || '',
          local: d.local || '',
          valorCartela: d.valorCartela || '',
          quantidadeCartelas: 100,
          cartelajInicio: (d.totalCartelas || d.quantidadeCartelas || 0) + 1,
        })
        setTotalGeradas(d.totalCartelas || d.quantidadeCartelas || 0)
        if (d.premioImageBase64) setImagePreview(d.premioImageBase64)
      } catch {
        toast.error('Erro ao carregar bingo.')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Selecione uma imagem válida.'); return }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const cartelaFim = Number(form.cartelajInicio) + Number(form.quantidadeCartelas) - 1

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.premio || !form.data || !form.local || !form.valorCartela) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    if (Number(form.cartelajInicio) < 1) {
      toast.error('O número inicial deve ser maior que 0.')
      return
    }
    setSubmitting(true)

    try {
      let premioImageBase64 = imagePreview
      if (imageFile) premioImageBase64 = await imageFileToBase64(imageFile)

      // Atualiza dados do bingo no Firestore
      await updateDoc(doc(db, 'bingos', id), {
        premio: form.premio,
        data: form.data,
        horario: form.horario,
        local: form.local,
        valorCartela: form.valorCartela,
        premioImageBase64,
        status: 'processing',
        totalCartelas: cartelaFim,
        updatedAt: new Date(),
      })

      toast.success(`Gerando cartelas ${form.cartelajInicio}–${cartelaFim}…`)

      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bingoId: id,
          ...form,
          quantidadeCartelas: Number(form.quantidadeCartelas),
          cartelajInicio: Number(form.cartelajInicio),
          premioImageBase64,
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
      a.download = `bingo-${id}-cartelas-${form.cartelajInicio}-${cartelaFim}.pdf`
      a.click()
      URL.revokeObjectURL(url)

      toast.success(`Cartelas ${form.cartelajInicio}–${cartelaFim} geradas!`)
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Erro ao gerar cartelas.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <Layout>
      <div className="flex-1 flex items-center justify-center text-gray-400">Carregando…</div>
    </Layout>
  )

  return (
    <Layout>
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-800">Editar Bingo</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Atualize as informações e gere mais cartelas a partir do número{' '}
              <strong className="text-[#0D1F3C]">{form.cartelajInicio}</strong>
            </p>
          </div>

          {/* Banner de info sobre cartelas já geradas */}
          {totalGeradas > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-2xl">📋</span>
              <div>
                <p className="text-sm font-bold text-blue-800">
                  {totalGeradas} cartela{totalGeradas !== 1 ? 's' : ''} já gerada{totalGeradas !== 1 ? 's' : ''} (1–{totalGeradas})
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  As novas cartelas começarão a partir do número <strong>{totalGeradas + 1}</strong>. Você pode alterar isso abaixo.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Prêmio */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎁</span> Prêmio</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Descrição <span className="text-red-500">*</span></label>
                    <input type="text" value={form.premio} onChange={set('premio')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Imagem do prêmio</label>
                    <div onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-[#0D1F3C] hover:bg-blue-50 transition-colors">
                      {imagePreview
                        ? <img src={imagePreview} alt="Preview" className="max-h-32 mx-auto rounded-lg object-contain" />
                        : <div className="flex flex-col items-center gap-2 text-gray-400"><ImageIcon size={28} /><span className="text-sm">Clique para alterar</span></div>}
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                </div>
              </section>

              {/* Cartelas — com controle de intervalo */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎟️</span> Cartelas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Valor <span className="text-red-500">*</span></label>
                    <input type="text" value={form.valorCartela} onChange={set('valorCartela')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade a gerar</label>
                    <input type="number" value={form.quantidadeCartelas} onChange={set('quantidadeCartelas')}
                      min={1} max={1000}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Número inicial <span className="text-red-500">*</span>
                    </label>
                    <input type="number" value={form.cartelajInicio} onChange={set('cartelajInicio')}
                      min={1}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]" required />
                    <p className="text-xs text-gray-400 mt-1">Próxima cartela disponível: {totalGeradas + 1}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Número final</label>
                    <div className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 font-bold">
                      {cartelaFim}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Calculado automaticamente</p>
                  </div>
                </div>

                {/* Preview do intervalo */}
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
                  ? <><Loader2 size={20} className="animate-spin" /> Gerando cartelas {form.cartelajInicio}–{cartelaFim}…</>
                  : <><Plus size={20} /> Gerar cartelas {form.cartelajInicio}–{cartelaFim}</>}
              </button>
            </form>

            <div className="lg:sticky lg:top-8">
              <BingoCardPreview form={form} imagePreview={imagePreview} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
