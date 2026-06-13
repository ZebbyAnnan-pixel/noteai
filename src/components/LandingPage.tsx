import { useState, useEffect } from 'react';
import {
  Brain,
  Upload,
  MessageCircle,
  FileText,
  Headphones,
  Quote,
  FolderOpen,
  Sparkles,
  RefreshCw,
  Shield,
  BookOpen,
  Search,
  Zap,
  Users,
  Building2,
  GraduationCap,
  Code,
  ChevronRight,
  Play,
  Check,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 11);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Upload,
      title: 'Source-Based AI',
      subtitle: 'Your Files, Your AI',
      description:
        'Upload PDFs, Docs, notes, and links. The AI reads and indexes everything, using ONLY your data for accurate, context-aware responses.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageCircle,
      title: 'Chat with Documents',
      subtitle: 'Interactive Learning',
      description:
        "Literally 'talk' to your notes. Ask questions, get explanations, compare topics - all based on YOUR material.",
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: FileText,
      title: 'Smart Summarization',
      subtitle: 'Instant Insights',
      description:
        'Summarize long PDFs, extract key points, create bullet notes, and generate study guides automatically.',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      icon: Headphones,
      title: 'Audio Overview',
      subtitle: 'Podcast Mode',
      description:
        'Convert your notes into a podcast-style audio discussion. Perfect for studying while walking or passive learning.',
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      icon: Quote,
      title: 'Source Citations',
      subtitle: 'No Hallucinations',
      description:
        'Every answer includes exact references from your files with clickable citations. Accurate, grounded, verified.',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      icon: FolderOpen,
      title: 'Notebook System',
      subtitle: 'Organized Workspaces',
      description:
        'Create multiple notebooks - one for school, projects, coding, or business. Each has its own sources and AI memory.',
      gradient: 'from-indigo-500 to-blue-500',
    },
    {
      icon: Search,
      title: 'Context-Aware Q&A',
      subtitle: 'Deep Understanding',
      description:
        'Understands relationships between documents and cross-references topics automatically. Connects ideas intelligently.',
      gradient: 'from-cyan-500 to-sky-500',
    },
    {
      icon: Sparkles,
      title: 'Note Generation',
      subtitle: 'Writing Assistant',
      description:
        'Generate essays, rewrite content, simplify complex topics, and create outlines from your source materials.',
      gradient: 'from-teal-500 to-emerald-500',
    },
    {
      icon: Brain,
      title: 'Idea Generation',
      subtitle: 'Brainstorming Partner',
      description:
        'Suggests new ideas, creates questions, and helps expand research based on your uploaded sources.',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Updates',
      subtitle: 'Always Current',
      description:
        'Add new files or edit notes and NotebookLM updates its understanding instantly. No re-training needed.',
      gradient: 'from-lime-500 to-green-500',
    },
    {
      icon: Shield,
      title: 'Privacy & Control',
      subtitle: 'Your Data, Your Rules',
      description:
        'Your data stays within your notebook. Not used for open internet responses. You control what the AI sees.',
      gradient: 'from-slate-500 to-gray-500',
    },
  ];

  const useCases = [
    {
      icon: GraduationCap,
      title: 'Students',
      items: ['Study notes', 'Exam prep', 'Concept explanation'],
      color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
      iconColor: 'text-blue-600',
    },
    {
      icon: BookOpen,
      title: 'Researchers',
      items: ['Analyze papers', 'Analyze papers', 'Compare sources', 'Extract insights'],
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Code,
      title: 'Developers',
      items: ['Understand docs', 'Summarize APIs', 'Plan projects'],
      color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
      iconColor: 'text-orange-600',
    },
    {
      icon: Building2,
      title: 'Entrepreneurs',
      items: ['Business ideas', 'Market research', 'Product planning'],
      color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
      iconColor: 'text-rose-600',
    },
  ];

  const inputTypes = [
    { name: 'PDFs', icon: '📄' },
    { name: 'Google Docs', icon: '📃' },
    { name: 'Notes', icon: '📝' },
    { name: 'Websites', icon: '🌐' },
    { name: 'YouTube', icon: '📺' },
  ];

  const comparison = [
    { feature: 'Uses your files', notebook: true, chatgpt: 'partial' },
    { feature: 'Internet knowledge', notebook: false, chatgpt: true },
    { feature: 'Source citations', notebook: true, chatgpt: 'partial' },
    { feature: 'Research depth', notebook: 'high-data', chatgpt: 'high-general' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 20 ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">NotebookLM</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Features
              </a>
              <a href="#use-cases" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Use Cases
              </a>
              <a href="#comparison" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Compare
              </a>
              <button
                onClick={onGetStarted}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all hover:scale-105"
              >
                Sign In
              </button>
            </div>

            <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg animate-slide-down">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-slate-600 font-medium">
                Features
              </a>
              <a href="#use-cases" className="block py-2 text-slate-600 font-medium">
                Use Cases
              </a>
              <a href="#comparison" className="block py-2 text-slate-600 font-medium">
                Compare
              </a>
              <button
                onClick={onGetStarted}
                className="w-full bg-slate-900 text-white px-4 py-3 rounded-lg font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Powered by Google AI
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-slide-up">
              Your Personal AI
              <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                Research Assistant
              </span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your documents, notes, and research. NotebookLM becomes an expert in YOUR content,
              providing accurate answers with source citations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="group bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-slate-200 hover:border-slate-300 transition-all hover:scale-105 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                Watch Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Your data stays private</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Instant setup</span>
              </div>
            </div>
          </div>

          {/* Supported Input Types */}
          <div className="mt-16 text-center">
            <p className="text-slate-500 text-sm font-medium mb-4">SUPPORTED INPUT TYPES</p>
            <div className="flex flex-wrap justify-center gap-3">
              {inputTypes.map((type) => (
                <div
                  key={type.name}
                  className="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-default flex items-center gap-2"
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="font-medium text-slate-700">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Core Concept */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Core Concept
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                AI Trained Only on YOUR Files
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mb-8 leading-relaxed">
                Upload your PDFs, notes, and documents. NotebookLM reads and understands everything,
                then provides accurate, context-aware responses{' '}
                <strong className="text-white">based only on your sources</strong>.
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Explains</div>
                    <div className="text-sm text-slate-400">Complex concepts made simple</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Summarizes</div>
                    <div className="text-sm text-slate-400">Key points extracted</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold">Answers</div>
                    <div className="text-sm text-slate-400">With source citations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Everything You Need to Master Your Research
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              From audio podcasts to real-time citations, NotebookLM transforms how you interact with
              information.
            </p>
          </div>

          {/* Featured Feature */}
          <div className="mb-16 relative min-h-[400px]">
            {features.map(
              (feature, index) =>
                index === activeFeature && (
                  <div key={feature.title} className="opacity-100 scale-100 transition-all duration-700">
                    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                      <div className="grid lg:grid-cols-2 gap-0">
                        <div className="p-8 sm:p-12 lg:p-16">
                          <div
                            className={`inline-flex items-center gap-2 bg-gradient-to-r ${feature.gradient} text-white px-4 py-2 rounded-full text-sm font-medium mb-6`}
                          >
                            <feature.icon className="w-4 h-4" />
                            {feature.subtitle}
                          </div>

                          <h3 className="text-3xl sm:text-4xl font-bold mb-4">{feature.title}</h3>
                          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            {feature.description}
                          </p>

                          <button
                            onClick={onGetStarted}
                            className="group bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all hover:scale-105 flex items-center gap-2"
                          >
                            Try Now
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>

                        <div
                          className={`bg-gradient-to-br ${feature.gradient} p-8 sm:p-12 lg:p-16 flex items-center justify-center min-h-[300px]`}
                        >
                          <feature.icon className="w-32 h-32 text-white/90" strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>

          {/* Feature Pills Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-16">
            {features.map((feature, index) => (
              <button
                key={feature.title}
                onClick={() => setActiveFeature(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  index === activeFeature
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {feature.title}
              </button>
            ))}
          </div>

          {/* Feature Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.slice(0, 6).map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Built For Everyone
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">Perfect For Your Workflow</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Whether you're a student, researcher, developer, or entrepreneur, NotebookLM adapts to
              your needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <div
                key={useCase.title}
                className={`group bg-white rounded-2xl p-6 border-2 ${useCase.color} transition-all hover:shadow-lg cursor-pointer`}
              >
                <useCase.icon className={`w-10 h-10 ${useCase.iconColor} mb-4`} />
                <h3 className="font-bold text-xl mb-3">{useCase.title}</h3>
                <ul className="space-y-2">
                  {useCase.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-slate-600">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="comparison" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              See the Difference
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">NotebookLM vs ChatGPT</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Different tools for different needs. Here's how they compare.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
              {/* Header */}
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
                <div className="p-4 font-semibold text-slate-600">Feature</div>
                <div className="p-4 font-semibold text-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
                  NotebookLM
                </div>
                <div className="p-4 font-semibold text-center text-slate-600">ChatGPT</div>
              </div>

              {/* Rows */}
              {comparison.map((row, index) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 ${
                    index !== comparison.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="p-4 font-medium">{row.feature}</div>
                  <div className="p-4 flex justify-center items-center bg-blue-50/50">
                    {row.notebook === true && (
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Yes
                      </div>
                    )}
                    {row.notebook === false && (
                      <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-sm">
                        Limited
                      </div>
                    )}
                    {row.notebook === 'high-data' && (
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        High (your data)
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex justify-center items-center">
                    {row.chatgpt === true && (
                      <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Yes
                      </div>
                    )}
                    {row.chatgpt === 'partial' && (
                      <div className="flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                        Sometimes
                      </div>
                    )}
                    {row.chatgpt === 'high-general' && (
                      <div className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">
                        High (general)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Transform Your Research?
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Upload your documents, chat with your sources, and discover insights you never knew
            existed.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-white/10 backdrop-blur text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all flex items-center gap-2">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">NotebookLM</span>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">
                Features
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
            </div>

            <div className="text-slate-500 text-sm">Powered by Google AI</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
