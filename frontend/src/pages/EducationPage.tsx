import { AppLayout } from '../layouts/AppLayout'
import { AppPageHeader } from '../components/AppPageHeader'

export function EducationPage() {
  return (
    <AppLayout>
      <AppPageHeader title="Diabetes Education" description="Doctor-approved resources, guides, and learning materials." />
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {[
           { title: 'Understanding Carb Ratios', category: 'Nutrition', readTime: '5 min read' },
           { title: 'Hypoglycemia Management', category: 'Safety', readTime: '8 min read' },
           { title: 'Optimizing Basal Insulin', category: 'Treatment', readTime: '6 min read' },
           { title: 'Exercise and Glucose', category: 'Lifestyle', readTime: '7 min read' },
           { title: 'Digital Twin Basics', category: 'Platform', readTime: '4 min read' },
         ].map((article, i) => (
           <div key={i} className="group cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:bg-gray-50 transition-colors">
              <div className="mb-4 inline-flex rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                {article.category}
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-emerald-600 transition-colors">{article.title}</h3>
              <p className="mt-4 text-sm font-bold text-slate-500">{article.readTime}</p>
           </div>
         ))}
      </div>
    </AppLayout>
  )
}
