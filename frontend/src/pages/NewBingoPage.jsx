import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'
import { Loader2, ImagePlus, X, Save, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Layout from '../components/Layout'
import BingoCardPreview from '../components/BingoCardPreview'
import { formatCurrency } from '../utils/currency'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '')

function resizeImage(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * ratio; canvas.height = img.height * ratio
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject; img.src = e.target.result
    }
    reader.onerror = reject; reader.readAsDataURL(file)
  })
}

function ImageSlot({ index, preview, onSelect, onRemove }) {
  const ref = useRef(null)
  return (
    <div>
      <div onClick={() => !preview && ref.current?.click()}
        className={`h-28 rounded-xl border-2 flex items-center justify-center overflow-hidden transition-colors relative
          ${preview ? 'border-blue-300' : 'border-dashed border-gray-200 hover:border-[#0D1F3C] hover:bg-blue-50 cursor-pointer'}`}>
        {preview
          ? <img src={preview} className="w-full h-full object-cover" alt={`Foto ${index+1}`} />
          : <div className="flex flex-col items-center gap-1 text-gray-400"><ImagePlus size={22}/><span className="text-xs font-medium">Foto {index+1}</span></div>
        }
        {preview && (
          <button onClick={e=>{e.stopPropagation();onRemove()}}
            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
            <X size={12}/>
          </button>
        )}
      </div>
      {preview && <button onClick={()=>ref.current?.click()} className="mt-1 w-full text-xs text-center text-gray-400 hover:text-[#0D1F3C]">Trocar foto</button>}
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e=>{if(e.target.files[0])onSelect(e.target.files[0])}}/>
    </div>
  )
}

export default function NewBingoPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState(null)
  const [imagePreviews, setImagePreviews] = useState([null,null,null])
  const [form, setForm] = useState({ premio:'', contato:'', data:'', horario:'', local:'', valorCartela:'', quantidadeCartelas:100 })

  const set = f => e => setForm(p => ({...p,[f]:e.target.value}))

  const handleImage = async (i, file) => {
    const b64 = await resizeImage(file)
    setImagePreviews(p => { const n=[...p]; n[i]=b64; return n })
  }
  const removeImage = i => setImagePreviews(p => { const n=[...p]; n[i]=null; return n })

  const handleSave = async () => {
    if (!form.premio || !form.data || !form.local || !form.valorCartela) {
      toast.error('Preencha os campos obrigatórios antes de salvar.')
      return
    }
    setSaving(true)
    try {
      const premioImagens = imagePreviews.filter(Boolean)
      if (savedId) {
        // Atualiza o bingo já salvo
        const { updateDoc, doc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'bingos', savedId), {
          ...form, premioImagens, premioImageBase64: premioImagens[0] || null,
          quantidadeCartelas: Number(form.quantidadeCartelas), updatedAt: new Date(),
        })
      } else {
        // Cria novo bingo
        const docRef = await addDoc(collection(db, 'bingos'), {
          ...form, premioImagens, premioImageBase64: premioImagens[0] || null,
          quantidadeCartelas: Number(form.quantidadeCartelas), status: 'draft', createdAt: serverTimestamp(),
        })
        setSavedId(docRef.id)
      }
      toast.success('Bingo salvo com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.premio||!form.data||!form.local||!form.valorCartela) { toast.error('Preencha todos os campos.'); return }
    setSubmitting(true)
    try {
      const premioImagens = imagePreviews.filter(Boolean)
      let bingoId = savedId
      if (!bingoId) {
        const docRef = await addDoc(collection(db,'bingos'), {
          ...form, premioImagens, premioImageBase64: premioImagens[0]||null,
          quantidadeCartelas: Number(form.quantidadeCartelas), status:'processing', createdAt: serverTimestamp(),
        })
        bingoId = docRef.id
        setSavedId(bingoId)
      } else {
        const { updateDoc, doc } = await import('firebase/firestore')
        await updateDoc(doc(db, 'bingos', bingoId), {
          ...form, premioImagens, premioImageBase64: premioImagens[0]||null,
          quantidadeCartelas: Number(form.quantidadeCartelas), status:'processing', updatedAt: new Date(),
        })
      }
      const res = await fetch(`${API_URL}/api/bingo/gerar`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ bingoId, ...form, premioImagens, premioImageBase64:premioImagens[0]||null, quantidadeCartelas:Number(form.quantidadeCartelas) }),
      })
      if (!res.ok) throw new Error((await res.json().catch(()=>({}))).detail||'Falha')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      Object.assign(document.createElement('a'),{href:url,download:`bingo-${bingoId}.pdf`}).click()
      URL.revokeObjectURL(url)
      toast.success(`${form.quantidadeCartelas} cartelas geradas!`)
      navigate('/admin')
    } catch(err) { toast.error(err.message||'Erro.') }
    finally { setSubmitting(false) }
  }

  return (
    <Layout>
      <div className="flex-1 px-6 py-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-gray-800">Novo Bingo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Configure e visualize antes de gerar</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <form onSubmit={handleSubmit} className="space-y-5">

              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎁</span> Prêmio</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nome do prêmio <span className="text-red-500">*</span></label>
                    <input type="text" value={form.premio} onChange={set('premio')} required placeholder="Ex: VW Golf Sportline 1.6"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Fotos do prêmio <span className="text-xs text-gray-400">(até 3 imagens)</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {[0,1,2].map(i => <ImageSlot key={i} index={i} preview={imagePreviews[i]} onSelect={f=>handleImage(i,f)} onRemove={()=>removeImage(i)}/>)}
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
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Horário</label>
                    <input type="time" value={form.horario} onChange={set('horario')}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Local <span className="text-red-500">*</span></label>
                    <input type="text" value={form.local} onChange={set('local')} required placeholder="Ex: Clube Recreativo Central"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Contato</label>
                    <input type="text" value={form.contato} onChange={set('contato')} placeholder="Ex: (86) 9 9999-9999"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><span>🎟️</span> Cartelas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Valor <span className="text-red-500">*</span></label>
                    <input type="text" value={form.valorCartela} required inputMode="numeric" placeholder="Ex: R$ 20,00"
                      onChange={e=>setForm(f=>({...f,valorCartela:formatCurrency(e.target.value)}))}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Quantidade <span className="text-red-500">*</span></label>
                    <input type="number" value={form.quantidadeCartelas} onChange={set('quantidadeCartelas')} min={1} max={1000} required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D1F3C]"/>
                    <p className="text-xs text-gray-400 mt-1">Máximo: 1.000</p>
                  </div>
                </div>
              </section>

              <div className="flex gap-3">
                <button type="button" onClick={handleSave} disabled={saving || submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-[#0D1F3C] text-[#0D1F3C] hover:bg-blue-50 font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base">
                  {saving ? <><Loader2 size={18} className="animate-spin"/> Salvando…</> : savedId ? <><CheckCircle size={18}/> Salvo</> : <><Save size={18}/> Salvar</>}
                </button>
                <button type="submit" disabled={submitting || saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0D1F3C] hover:bg-[#162E58] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 text-base">
                  {submitting ? <><Loader2 size={18} className="animate-spin"/> Gerando…</> : <>Gerar PDF</>}
                </button>
              </div>
            </form>

            <div className="lg:sticky lg:top-8">
              <BingoCardPreview form={form} imagePreviews={imagePreviews}/>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
