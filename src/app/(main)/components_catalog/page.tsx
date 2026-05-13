import { CoverSizeWidgetExamples } from './examples/CoverSizeWidgetExamples'
import { EditListExamples } from './examples/EditListExamples'
import { SideBySideControlsExamples } from './examples/SideBySideControlsExamples'
import { ChevronRight, BookOpen, MousePointer2, Info, Layout, CheckSquare, Bell } from 'lucide-react'

export default function ComponentsCatalogPage() {
  return (
    <div className="mx-auto w-full max-w-7xl p-8">
      <div className="mb-12">
        <h1 className="mb-2 text-4xl font-black uppercase tracking-tighter text-white">Design System</h1>
        <p className="text-white/40 font-mono text-sm">v2.0 Glassmorphic Modernization</p>
      </div>

      {/* Table of Contents */}
      <section className="mb-12">
        <h2 className="mb-8 text-xs font-black uppercase tracking-[0.3em] text-white/30">System Components</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { href: '/components_catalog/items', label: 'Item Components', icon: BookOpen },
            { href: '/components_catalog/buttons', label: 'Button Components', icon: MousePointer2 },
            { href: '/components_catalog/icons', label: 'Icon & Indicator', icon: Info },
            { href: '/components_catalog/inputs', label: 'Input & Selection', icon: Layout },
            { href: '/components_catalog/modals', label: 'Modal Components', icon: Layout },
            { href: '/components_catalog/checkboxes', label: 'Checkbox & Switch', icon: CheckSquare },
            { href: '/components_catalog/alerts', label: 'Alert & Notification', icon: Bell },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-primary/50 flex items-center gap-4 rounded-2xl p-6 transition-all hover:scale-[1.02] active:scale-[0.98] group shadow-2xl"
            >
              <div className="bg-primary/20 p-3 rounded-xl group-hover:bg-primary/30 transition-colors">
                <item.icon size={24} className="text-primary" />
              </div>
              <div className="grow">
                <p className="text-white/90 text-sm font-black uppercase tracking-widest">{item.label}</p>
              </div>
              <ChevronRight size={18} className="text-white/20 group-hover:text-primary transition-colors" />
            </a>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-white/30">Misc. Examples</h3>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <li>
              <a href="#side-by-side-controls-components" className="text-white/60 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">
                Side By Side Controls
              </a>
            </li>
            <li>
              <a href="#cover-size-widget-examples" className="text-white/60 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">
                Cover Size Widget
              </a>
            </li>
            <li>
              <a href="#edit-list-examples" className="text-white/60 hover:text-primary transition-colors text-sm font-black uppercase tracking-widest">
                Edit List
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div id="side-by-side-controls-components">
        <SideBySideControlsExamples />
      </div>
      <div id="cover-size-widget-examples">
        <CoverSizeWidgetExamples />
      </div>
      <div id="edit-list-examples">
        <EditListExamples />
      </div>
    </div>
  )
}
