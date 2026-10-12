import { useMemo, useState } from 'react'
import './App.css'
import heroIllustration from './assets/hero.png'
import { askAI } from './aiService'

const navGroups = [
  { label: 'Marketing', items: ['Dashboard', 'Campaigns', 'Contacts', 'Segments'] },
  { label: 'Automation', items: ['Journeys', 'Automation', 'AI Studio'] },
  { label: 'Insights', items: ['Reports', 'Settings'] },
]

const navIcons = {
  Dashboard: '◫',
  Campaigns: '▣',
  Contacts: '◌',
  Segments: '▤',
  Journeys: '⇄',
  Automation: '⚙',
  'AI Studio': '✦',
  Reports: '▨',
  Settings: '◍',
}

const statCards = [
  { label: 'Contacts', value: '600', tone: 'blue' },
  { label: 'Open rate', value: '45%', tone: 'green' },
  { label: 'AI segments', value: '4', tone: 'orange' },
  { label: 'Model health', value: '77%', tone: 'gold' },
]

const journeyCards = [
  { name: 'Lead Nurture', status: 'Running', value: '92%' },
  { name: 'Re-engagement', status: 'Optimizing', value: '84%' },
  { name: 'Lifecycle Score', status: 'Healthy', value: '96%' },
]

const quickActions = ['Launch campaign', 'Review AI segments', 'Sync audience']

const reportsRows = [
  { name: 'Spring launch', channel: 'Email', results: '41% CTR', status: 'Above target' },
  { name: 'Welcome flow', channel: 'SMS', results: '3.2x ROAS', status: 'Healthy' },
  { name: 'Retention loop', channel: 'Lifecycle', results: '92% retention', status: 'Optimized' },
]

const segmentationRows = [
  { name: 'High intent buyers', size: '1,520', score: '92', tag: 'Priority' },
  { name: 'Returning customers', size: '860', score: '88', tag: 'Loyal' },
  { name: 'Win-back leads', size: '430', score: '79', tag: 'Recover' },
]

const campaignCanvasSteps = [
  { name: 'Trigger', detail: 'Lead enters segment', status: 'Active' },
  { name: 'AI score', detail: 'Predict conversion', status: 'Live' },
  { name: 'Message', detail: 'Personalized copy', status: 'Draft' },
  { name: 'Action', detail: 'Send automation', status: 'Queued' },
]

const contactRows = [
  { name: 'Alicia Stone', segment: 'High intent', score: '92', status: 'Ready', last: '2 hours ago' },
  { name: 'Marcus Lee', segment: 'Returning buyer', score: '88', status: 'Nurture', last: '1 day ago' },
  { name: 'Priya Nair', segment: 'Win-back', score: '79', status: 'Review', last: '3 days ago' },
  { name: 'Isaac Moore', segment: 'Lifecycle', score: '94', status: 'Ready', last: 'Just now' },
  { name: 'Chloe Davis', segment: 'New lead', score: '71', status: 'Warm', last: '4 hours ago' },
]

const campaignEditorSteps = [
  { name: 'Audience filters', state: 'Ready' },
  { name: 'AI lead scoring', state: 'Live' },
  { name: 'Content variant', state: 'Draft' },
  { name: 'Send schedule', state: 'Queued' },
]

const pillarCards = [
  {
    title: 'Segment Intelligence',
    value: '14 AI groups',
    description: 'Cluster customers by behavior to identify the most valuable audiences for targeted outreach.',
    accent: 'orange',
    bullet: 'High-intent cohorts • Behavioral clustering • Revive churn risk',
  },
  {
    title: 'Conversion Prediction',
    value: '89% confidence',
    description: 'Predict who is most likely to respond and prioritize high-probability leads with explainable scores.',
    accent: 'blue',
    bullet: 'Lead scoring • Next-best action • Customer propensity',
  },
  {
    title: 'Campaign Optimization',
    value: '3.8x ROI',
    description: 'Compare broad-send performance with targeted outreach to improve conversion lift and marketing efficiency.',
    accent: 'green',
    bullet: 'Budget allocation • Channel mix • Performance lift',
  },
]

const campaignTemplates = [
  { name: 'Welcome sequence', channel: 'Email + SMS', status: 'Live', lift: '+31%' },
  { name: 'Product launch', channel: 'Email + Social', status: 'Scheduled', lift: '+24%' },
  { name: 'Retention loop', channel: 'Lifecycle flow', status: 'Optimizing', lift: '+42%' },
]

const automationSteps = [
  { label: 'Lead capture', value: '95%', tone: 'orange' },
  { label: 'AI scoring', value: '89%', tone: 'blue' },
  { label: 'Audience sync', value: '91%', tone: 'green' },
  { label: 'Delivery trigger', value: '97%', tone: 'gold' },
]

const profileStats = [
  { label: 'Campaigns launched', value: '18' },
  { label: 'Audience score', value: '92%' },
  { label: 'Automation uptime', value: '99.8%' },
]

const permissions = ['AI campaign optimization', 'Audience segmentation', 'Lead scoring', 'Automation approvals']

const adminTrendData = [28, 34, 41, 39, 52, 58, 64]
const userTrendData = [18, 24, 31, 36, 44, 49, 57]
const channelData = [
  { label: 'Email', value: 78 },
  { label: 'Social', value: 66 },
  { label: 'Search', value: 58 },
  { label: 'SMS', value: 42 },
]

const demoUsers = {
  'dmaut_admin@dmaut.ai': {
    name: 'Alice Rodriguez',
    password: 'Dm@ut!2026',
    role: 'admin',
    title: 'Marketing operations lead',
  },
  'dmaut_user@dmaut.ai': {
    name: 'Maya Singh',
    password: 'User@DMAUT!2026',
    role: 'user',
    title: 'Campaign strategist',
  },
}

function TrendChart({ data, color = '#eb6a48' }) {
  const width = 320
  const height = 150
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width
      const y = height - ((value - min) / range) * (height - 20) - 10
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-label="Performance trend chart">
        <defs>
          <linearGradient id={`lineGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((step) => (
          <line
            key={step}
            x1="0"
            x2={width}
            y1={10 + step * 32}
            y2={10 + step * 32}
            stroke="rgba(19,39,61,0.08)"
            strokeWidth="1"
          />
        ))}
        <polyline
          fill="none"
          stroke={`url(#lineGradient-${color.replace('#', '')})`}
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
      <div className="chart-labels">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, index) => (
          <span key={label}>{index < data.length ? label : ''}</span>
        ))}
      </div>
    </div>
  )
}

function BarChart({ data, color = '#eb6a48' }) {
  const max = Math.max(...data.map((item) => item.value))

  return (
    <div className="channel-chart">
      {data.map((item) => (
        <div key={item.label} className="channel-row">
          <div className="channel-meta">
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
          </div>
          <div className="channel-track">
            <span style={{ width: `${(item.value / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function ChatPanel({ title = 'AI assistant' }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hi! I can help with campaign ideas, audience scoring, and automation recommendations.',
    },
    {
      id: 2,
      sender: 'user',
      text: 'Review the strongest conversion opportunities for this week.',
    },
  ])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmed = draft.trim()
    if (!trimmed || isLoading) return

    const nextUserMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
    }

    setMessages((current) => [...current, nextUserMessage])
    setDraft('')
    setIsLoading(true)

    try {
      const response = await askAI(trimmed)
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: response,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div>
          <span className="chat-label">AI chat</span>
          <h3>{title}</h3>
        </div>
        <span className={`api-key-state ${isLoading ? 'waiting' : 'ready'}`}>
          {isLoading ? 'Thinking...' : 'Live AI'}
        </span>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message-row ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-row bot">
            <div className="message-bubble typing">Generating strategy...</div>
          </div>
        )}
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask the AI assistant..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={isLoading}
        />
        <button type="submit" className="primary-btn" disabled={isLoading}>
          {isLoading ? 'Wait' : 'Send'}
        </button>
      </form>
    </div>
  )
}

function App() {
  const [screen, setScreen] = useState('login')
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [audienceSize, setAudienceSize] = useState(68)
  const [targetStrength, setTargetStrength] = useState(42)
  const [showPassword, setShowPassword] = useState(false)
  const [activeUser, setActiveUser] = useState(null)
  const [loginError, setLoginError] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const lift = useMemo(() => {
    const base = 35
    return Math.min(72, base + targetStrength * 0.8)
  }, [targetStrength])

  const handleLogin = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = form.email.value.trim().toLowerCase()
    const password = form.password.value
    const user = demoUsers[email]

    if (!user || user.password !== password) {
      setLoginError('Invalid email or password. Try the admin or user demo credentials.')
      return
    }

    setActiveUser(user)
    setLoginError('')
    setScreen(user.role === 'admin' ? 'app' : 'user-dashboard')
  }

  const handleLogout = () => {
    setActiveUser(null)
    setActiveNav('Dashboard')
    setScreen('login')
    setLoginError('')
    setShowPassword(false)
  }

  const profileName = activeUser?.name || 'Alice Rodriguez'
  const profileTitle = activeUser?.title || 'Marketing operations lead'
  const profileRole = activeUser?.role === 'admin' ? 'Workspace owner' : 'Marketing user'
  const isUserSession = activeUser?.role === 'user'

  const handleNavClick = (item) => {
    setActiveNav(item)

    if (item === 'Contacts') {
      setScreen('contacts')
      return
    }

    if (item === 'Campaigns') {
      setScreen('campaign-editor')
      return
    }

    if (item === 'Settings') {
      setScreen('profile')
      return
    }

    setScreen('app')
  }

  const dashboardOverview = {
    Dashboard: {
      heading: 'AI-Enabled Marketing Automation and Campaign Optimization',
      copy: 'Use AI to understand customer intent, score leads, personalize campaigns, and optimize every marketing action across channels in real time.',
      summaryLabel: 'AI conversion lift',
      summaryValue: `${lift.toFixed(0)}%`,
      summaryNote: 'vs. previous campaign',
      secondaryLabel: 'Best audience',
      secondaryValue: 'Segment B',
      secondaryNote: 'High intent • 41% CTR',
    },
    Campaigns: {
      heading: 'Campaign performance tracking',
      copy: 'Review campaign delivery, creative performance, and AI recommendations across all active outbound journeys.',
      summaryLabel: 'Campaign ROI',
      summaryValue: '3.8x',
      summaryNote: 'this quarter',
      secondaryLabel: 'Best channel',
      secondaryValue: 'Email',
      secondaryNote: 'Open rate • 58%',
    },
    Contacts: {
      heading: 'Audience and contact intelligence',
      copy: 'Monitor lead quality, lifecycle stages, and high-intent contacts so the next AI-driven action reaches the right people.',
      summaryLabel: 'Qualified leads',
      summaryValue: '2,840',
      summaryNote: 'this month',
      secondaryLabel: 'Lead health',
      secondaryValue: 'Strong',
      secondaryNote: '92% engaged',
    },
    Segments: {
      heading: 'Segment optimization engine',
      copy: 'Build behavior-focused segments with AI-driven clustering and priority targeting for each revenue opportunity.',
      summaryLabel: 'Active segments',
      summaryValue: '14',
      summaryNote: 'updated daily',
      secondaryLabel: 'Priority cohort',
      secondaryValue: 'High intent',
      secondaryNote: '3.2x CTR',
    },
    Journeys: {
      heading: 'Lifecycle journey performance',
      copy: 'Track automations from acquisition to conversion and improve each journey with AI-optimized timing and triggers.',
      summaryLabel: 'Journeys active',
      summaryValue: '9',
      summaryNote: '2 scaling',
      secondaryLabel: 'Fastest mover',
      secondaryValue: 'Re-engage',
      secondaryNote: '84% efficiency',
    },
    Automation: {
      heading: 'Automation workflow health',
      copy: 'Measure automation coverage, trigger confidence, and execution results across the platform.',
      summaryLabel: 'Workflow pass rate',
      summaryValue: '94%',
      summaryNote: 'last 7 days',
      secondaryLabel: 'Bottleneck',
      secondaryValue: 'Lead routing',
      secondaryNote: 'stable +12%',
    },
    'AI Studio': {
      heading: 'AI Studio recommendations',
      copy: 'Explore prompt-based campaigns, model output quality, and recommendations generated for your marketers.',
      summaryLabel: 'AI suggestions',
      summaryValue: '63',
      summaryNote: 'waiting review',
      secondaryLabel: 'Model score',
      secondaryValue: '89/100',
      secondaryNote: 'high confidence',
    },
    Reports: {
      heading: 'Reporting and analytics',
      copy: 'Review acquisition, engagement, and conversion trends with a unified overview for business leaders.',
      summaryLabel: 'Pipeline value',
      summaryValue: '$4.8M',
      summaryNote: 'forecasted',
      secondaryLabel: 'Weekly delta',
      secondaryValue: '+21%',
      secondaryNote: 'vs. baseline',
    },
  }

  const selectedOverview = dashboardOverview[activeNav] || dashboardOverview.Dashboard

  const renderDashboardSection = () => {
    const commonHeader = (
      <div className="panel-header">
        <h3>{activeNav === 'Dashboard' ? 'Campaign optimization overview' : `${activeNav} overview`}</h3>
        <button type="button" className="mini-btn">View report</button>
      </div>
    )

    if (activeNav === 'Campaigns') {
      return (
        <div className="section-view campaign-view">
          <div className="section-header">
            <h3>Campaign builder</h3>
            <button type="button" className="mini-btn">New campaign</button>
          </div>

          <div className="campaign-builder-grid">
            <div className="panel-box builder-panel">
              <div className="panel-header compact">
                <h3>Templates</h3>
                <span className="chart-pill neutral">AI suggested</span>
              </div>
              <div className="builder-list">
                {campaignTemplates.map((campaign) => (
                  <article key={campaign.name} className="builder-card">
                    <div className="builder-head">
                      <div>
                        <h4>{campaign.name}</h4>
                        <small>{campaign.channel}</small>
                      </div>
                      <span className={`chip ${campaign.status === 'Live' ? 'orange' : campaign.status === 'Scheduled' ? 'blue' : 'green'}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="builder-metrics">
                      <strong>{campaign.lift}</strong>
                      <span>Conversion lift</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel-box builder-panel">
              <div className="panel-header compact">
                <h3>Campaign flow</h3>
                <span className="chart-pill positive">+41%</span>
              </div>
              <div className="campaign-funnel">
                <div className="funnel-stage"><span>Trigger</span><strong>Lead entered</strong></div>
                <div className="funnel-stage"><span>AI score</span><strong>Segment matched</strong></div>
                <div className="funnel-stage"><span>Send</span><strong>Personalized email</strong></div>
                <div className="funnel-stage"><span>Optimize</span><strong>Retarget low CTR</strong></div>
              </div>
            </div>
          </div>

          <div className="panel-box campaign-canvas-panel">
            <div className="panel-header">
              <h3>Campaign canvas</h3>
              <button type="button" className="mini-btn">View details</button>
            </div>
            <div className="campaign-canvas-grid">
              {campaignCanvasSteps.map((step) => (
                <div key={step.name} className="canvas-step">
                  <span className="canvas-label">{step.name}</span>
                  <strong>{step.detail}</strong>
                  <small>{step.status}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="campaign-grid">
            {[
              { name: 'Spring launch', status: 'Live', result: '41% CTR', color: 'orange' },
              { name: 'Retention flow', status: 'Optimizing', result: '3.2x ROAS', color: 'green' },
              { name: 'Upsell sequence', status: 'Paused', result: '29% CVR', color: 'blue' },
            ].map((campaign) => (
              <article key={campaign.name} className="data-card campaign-card">
                <div className="card-topline">
                  <span className={`chip ${campaign.color}`}>{campaign.status}</span>
                </div>
                <h4>{campaign.name}</h4>
                <p>{campaign.result}</p>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (activeNav === 'Contacts') {
      return (
        <div className="section-view contacts-view">
          {commonHeader}
          <div className="contact-grid">
            {[
              { label: 'Qualified leads', value: '2,840', tone: 'blue' },
              { label: 'MQLs', value: '1,200', tone: 'green' },
              { label: 'Inactive', value: '480', tone: 'orange' },
              { label: 'Hot prospects', value: '216', tone: 'gold' },
            ].map((item) => (
              <article key={item.label} className={`stat-card ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (activeNav === 'Segments') {
      return (
        <div className="section-view segments-view">
          {commonHeader}
          <div className="segment-grid">
            {[
              ['High intent buyers', '1,520', 'Ready to convert'],
              ['Returning customers', '860', 'Loyal audience'],
              ['Win-back users', '430', 'Needs reactivation'],
            ].map(([name, value, note]) => (
              <article key={name} className="data-card segment-card">
                <h4>{name}</h4>
                <strong>{value}</strong>
                <p>{note}</p>
              </article>
            ))}
          </div>

          <div className="panel-box segmentation-panel">
            <div className="panel-header">
              <h3>AI segment breakdown</h3>
              <button type="button" className="mini-btn">Update rules</button>
            </div>
            <div className="segmentation-table-wrap">
              <table className="segmentation-table">
                <thead>
                  <tr>
                    <th>Segment</th>
                    <th>Audience</th>
                    <th>AI score</th>
                    <th>Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {segmentationRows.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.size}</td>
                      <td>{row.score}</td>
                      <td><span className="segment-tag">{row.tag}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    if (activeNav === 'Journeys') {
      return (
        <div className="section-view journeys-view">
          <div className="section-header">
            <h3>Lifecycle journeys</h3>
            <button type="button" className="mini-btn">Build flow</button>
          </div>
          <div className="journey-flow">
            {['Acquire', 'Nurture', 'Convert', 'Retain'].map((step, index) => (
              <div key={step} className="flow-node">
                <span>{step}</span>
                <strong>{index === 0 ? '72%' : index === 1 ? '68%' : index === 2 ? '55%' : '61%'}</strong>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (activeNav === 'Automation') {
      return (
        <div className="section-view automation-view">
          <div className="section-header">
            <h3>Automation workspace</h3>
            <button type="button" className="mini-btn">Run workflow</button>
          </div>

          <div className="automation-board-grid">
            <div className="panel-box workflow-panel">
              <div className="panel-header compact">
                <h3>Workflow health</h3>
                <span className="chart-pill positive">Live</span>
              </div>
              <div className="automation-steps">
                {automationSteps.map((step) => (
                  <div key={step.label} className={`step-row ${step.tone}`}>
                    <span>{step.label}</span>
                    <strong>{step.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-box workflow-panel">
              <div className="panel-header compact">
                <h3>Flow orchestration</h3>
                <span className="chart-pill neutral">AI guided</span>
              </div>
              <div className="logic-flow">
                {['Capture', 'Score', 'Segment', 'Launch', 'Optimize'].map((step, index) => (
                  <div key={step} className="logic-node">
                    <span>{index + 1}</span>
                    <strong>{step}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="automation-board">
            {[
              { name: 'Lead scoring', value: '96%' },
              { name: 'Audience sync', value: '88%' },
              { name: 'Workflow routing', value: '91%' },
            ].map((item) => (
              <article key={item.name} className="data-card automation-card">
                <span>{item.name}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (activeNav === 'AI Studio') {
      return (
        <div className="section-view ai-view">
          <div className="section-header">
            <h3>AI recommendations</h3>
            <button type="button" className="mini-btn">Generate prompt</button>
          </div>
          <div className="ai-grid">
            {[
              ['Audience expansion', 'New lead clusters found'],
              ['Creative optimization', 'Headlines boosted by 24%'],
              ['Budget reallocation', 'Shift spend to email + search'],
            ].map(([title, desc]) => (
              <article key={title} className="data-card ai-card">
                <h4>{title}</h4>
                <p>{desc}</p>
              </article>
            ))}
          </div>
        </div>
      )
    }

    if (activeNav === 'Reports') {
      return (
        <div className="section-view reports-view">
          {commonHeader}
          <div className="report-grid">
            {[
              { label: 'Revenue forecast', value: '$4.8M', tone: 'blue' },
              { label: 'CPA', value: '$24', tone: 'green' },
              { label: 'Retention', value: '72%', tone: 'orange' },
              { label: 'LTV', value: '$680', tone: 'gold' },
            ].map((item) => (
              <article key={item.label} className={`stat-card ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="panel-box report-page-panel">
            <div className="panel-header">
              <h3>Performance report</h3>
              <button type="button" className="mini-btn">Export PDF</button>
            </div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Campaign</th>
                    <th>Channel</th>
                    <th>Results</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportsRows.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td>{row.channel}</td>
                      <td>{row.results}</td>
                      <td><span className="report-status">{row.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="section-view dashboard-view">
        <div className="main-column">
          <div className="panel-header">
            <h3>Campaign optimization overview</h3>
            <button type="button" className="mini-btn">View report</button>
          </div>

          <div className="stats-row">
            {statCards.map((item) => (
              <article key={item.label} className={`stat-card ${item.tone}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </div>

          <div className="feature-strip">
            {[
              {
                title: 'Audience intelligence',
                text: 'Pinpoint high-intent customers and cluster them into segments with validated buying signals.',
                accent: 'orange',
              },
              {
                title: 'Creative testing',
                text: 'Compare campaign variants in real time and adapt headlines, channel mix, and timing.',
                accent: 'blue',
              },
              {
                title: 'Revenue acceleration',
                text: 'Turn weak conversions into predictable pipeline growth with AI-guided recommendations.',
                accent: 'green',
              },
            ].map((feature) => (
              <article key={feature.title} className={`feature-card ${feature.accent}`}>
                <span className="feature-kicker">Live signal</span>
                <h4>{feature.title}</h4>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>

          <div className="pillar-grid">
            {pillarCards.map((card) => (
              <article key={card.title} className={`pillar-card ${card.accent}`}>
                <div className="pillar-topline">
                  <span className="pillar-badge">AI module</span>
                  <span className="pillar-value">{card.value}</span>
                </div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
                <div className="pillar-bullet">{card.bullet}</div>
              </article>
            ))}
          </div>

          <div className="visual-grid">
            <div className="panel-box chart-card">
              <div className="panel-header">
                <h3>Campaign trend</h3>
                <span className="chart-pill positive">+{lift.toFixed(0)}%</span>
              </div>
              <TrendChart data={adminTrendData} color="#eb6a48" />
            </div>

            <div className="panel-box chart-card">
              <div className="panel-header">
                <h3>Channel performance</h3>
                <span className="chart-pill neutral">Live</span>
              </div>
              <BarChart data={channelData} color="#f49b66" />
            </div>
          </div>

          <div className="chart-panel">
            <div className="chart-header">
              <span>AI campaign performance</span>
              <strong>+{lift.toFixed(0)}%</strong>
            </div>

            <div className="bars">
              <div className="bar-wrap">
                <label>High intent leads</label>
                <div className="bar-track"><span style={{ width: `${audienceSize}%` }}></span></div>
              </div>
              <div className="bar-wrap">
                <label>Engagement score</label>
                <div className="bar-track"><span style={{ width: `${targetStrength + 20}%` }}></span></div>
              </div>
              <div className="bar-wrap">
                <label>Automation coverage</label>
                <div className="bar-track"><span style={{ width: '82%' }}></span></div>
              </div>
            </div>
          </div>

          <div className="pipeline-panel">
            <div className="panel-header">
              <h3>Automation pipeline</h3>
              <button type="button" className="mini-btn">Manage journeys</button>
            </div>

            <div className="pipeline-grid">
              {journeyCards.map((journey) => (
                <div key={journey.name} className="journey-card">
                  <div>
                    <span className="journey-name">{journey.name}</span>
                    <small>{journey.status}</small>
                  </div>
                  <strong>{journey.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-section">
            <ChatPanel title="Admin AI assistant" />
          </div>
        </div>

        <aside className="side-column">
          <div className="panel-box">
            <div className="panel-title">Audience optimization</div>

            <div className="slider-group">
              <label className="slider-row">
                <span>Audience size</span>
                <strong>{audienceSize}%</strong>
              </label>
              <input
                type="range"
                min="20"
                max="100"
                value={audienceSize}
                onChange={(event) => setAudienceSize(Number(event.target.value))}
              />
            </div>

            <div className="slider-group">
              <label className="slider-row">
                <span>Targeting strength</span>
                <strong>{targetStrength}%</strong>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                value={targetStrength}
                onChange={(event) => setTargetStrength(Number(event.target.value))}
              />
            </div>
          </div>

          <div className="panel-box">
            <div className="panel-title">AI workflow</div>

            <div className="workflow-list">
              <button type="button" className="workflow-item active">
                <span className="dot"></span>
                Segment
              </button>
              <button type="button" className="workflow-item">
                <span className="dot"></span>
                Personalize
              </button>
              <button type="button" className="workflow-item">
                <span className="dot"></span>
                Automate
              </button>
            </div>
          </div>
        </aside>
      </div>
    )
  }

  const renderContactsScreen = () => (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <h1>DMAUT</h1>
            <p>AI Automation</p>
          </div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <div className="user-panel">
          <span>Signed in as</span>
          <strong>{activeUser?.role || 'admin'}</strong>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={activeNav === item ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="nav-icon">{navIcons[item] || '•'}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="crumbs">
            <span>Audience</span>
            <span className="separator">/</span>
            <span>Contacts</span>
          </div>

          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={() => setScreen('app')}>Return to dashboard</button>
            <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
            <button type="button" className="primary-btn">Export list</button>
          </div>
        </header>

        <section className="panel-box contact-page-panel">
          <div className="panel-header">
            <h3>Contact database</h3>
            <button type="button" className="mini-btn">Add contact</button>
          </div>

          <div className="contact-toolbar">
            <div className="toolbar-search">Search contacts</div>
            <div className="toolbar-tags">
              <span>All</span>
              <span>High intent</span>
              <span>Returning</span>
            </div>
          </div>

          <div className="contact-table-wrap">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Segment</th>
                  <th>AI score</th>
                  <th>Status</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {contactRows.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.segment}</td>
                    <td>{row.score}</td>
                    <td><span className="contact-status">{row.status}</span></td>
                    <td>{row.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )

  const renderCampaignEditorScreen = () => (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <h1>DMAUT</h1>
            <p>AI Automation</p>
          </div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <div className="user-panel">
          <span>Signed in as</span>
          <strong>{activeUser?.role || 'admin'}</strong>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={activeNav === item ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="nav-icon">{navIcons[item] || '•'}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="crumbs">
            <span>Marketing</span>
            <span className="separator">/</span>
            <span>Campaign editor</span>
          </div>

          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={() => setScreen('app')}>Back to dashboard</button>
            <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
            <button type="button" className="primary-btn">Save campaign</button>
          </div>
        </header>

        <section className="campaign-editor-layout">
          <div className="panel-box editor-main">
            <div className="panel-header">
              <h3>Spring launch campaign</h3>
              <span className="chart-pill positive">Ready</span>
            </div>

            <div className="editor-form">
              <label>
                Campaign name
                <input defaultValue="Spring launch campaign" />
              </label>
              <label>
                Audience
                <input defaultValue="High-intent buyers + returning customers" />
              </label>
              <label>
                Objective
                <textarea defaultValue="Promote the spring offers to customers with the strongest purchase intent and highest predicted engagement." />
              </label>
            </div>
          </div>

          <div className="panel-box editor-side">
            <div className="panel-header compact">
              <h3>Campaign steps</h3>
            </div>
            <div className="editor-steps">
              {campaignEditorSteps.map((step) => (
                <div key={step.name} className="editor-step">
                  <div>
                    <strong>{step.name}</strong>
                  </div>
                  <span>{step.state}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )

  if (screen === 'user-dashboard') {
    return renderUserDashboardScreen()
  }

  if (screen === 'contacts') {
    return renderContactsScreen()
  }

  if (screen === 'campaign-editor') {
    return renderCampaignEditorScreen()
  }

  if (screen === 'login') {
    return (
      <div className="auth-shell">
        <header className="page-topbar">
          <div className="topbar-spacer" />
          <button type="button" className="deploy-button">Deploy</button>
        </header>

        <main className="login-center-panel">
          <div className="login-brand-card">
            <div className="login-icon" aria-hidden="true">🎓</div>
            <div className="login-brand-name">DMAUT</div>
            <p className="login brand-subtitle">AI-powered campaign targeting for your business</p>
          </div>

          <div className="login-form-panel">
            <div className="login-form-header">
              <button type="button" className="login-form-toggle active">Log in</button>
              <button type="button" className="login-form-toggle">Create account</button>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <label>
                Username
                <input name="email" type="email" defaultValue="dmaut_admin@dmaut.ai" />
              </label>

              <label>
                Password
                <div className="password-wrapper">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    defaultValue="Dm@ut!2026"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </label>

              {loginError && <div className="login-error">{loginError}</div>}

              <button type="submit" className="primary-btn login-btn">Log in</button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  const renderUserDashboardScreen = () => (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} user-theme`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <h1>DMAUT</h1>
            <p>AI Automation</p>
          </div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <div className="user-panel">
          <span>Signed in as</span>
          <strong>{activeUser?.name || 'Maya Singh'}</strong>
        </div>

        <div className="workspace-card user-workspace-card">
          <span className="workspace-label">Workspace health</span>
          <strong>Customer workspace</strong>
          <div className="mini-metrics">
            <div>
              <span>ROI</span>
              <strong>2.9x</strong>
            </div>
            <div>
              <span>AI score</span>
              <strong>88%</strong>
            </div>
          </div>
          <small>Campaigns ready for review</small>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={activeNav === item ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="nav-icon">{navIcons[item] || '•'}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-tip">
          <span className="tip-label">AI assistant</span>
          <strong>Recommended next move</strong>
          <p>Review which audience segments will produce the best targeting outcome for your next campaign.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="crumbs">
            <span>User dashboard</span>
            <span className="separator">/</span>
            <span>{activeNav}</span>
          </div>

          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={() => setScreen('profile')}>Profile</button>
            <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
            <button type="button" className="primary-btn">Launch AI</button>
          </div>
        </header>

        <div className="top-toolbar panel-box">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn active">Overview</button>
            <button type="button" className="toolbar-btn">Campaigns</button>
            <button type="button" className="toolbar-btn">Audience</button>
          </div>
          <div className="toolbar-group right-group">
            <span className="toolbar-pill">Last 30 days</span>
            <button type="button" className="toolbar-btn accent">Generate report</button>
          </div>
        </div>

        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">DMAUT AI</span>
            <h2>AI campaign optimization for your marketing team</h2>
            <p>
              Focus on the audiences, offers, and journeys with the highest predicted conversion potential for your next launch.
            </p>
            <div className="hero-actions">
              {quickActions.map((action) => (
                <button key={action} type="button" className="hero-button">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-summary">
            <div className="summary-card">
              <span>Predicted lift</span>
              <strong>41%</strong>
              <small>vs. standard campaign</small>
            </div>
            <div className="summary-card muted">
              <span>Top segment</span>
              <strong>High intent</strong>
              <small>91% engagement</small>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-frame">
              <img src={heroIllustration} alt="DMAUT AI marketing dashboard illustration" />
            </div>
            <div className="mini-floating-card floating-top">
              <span>AI score</span>
              <strong>94%</strong>
            </div>
            <div className="mini-floating-card floating-bottom">
              <span>Revenue uplift</span>
              <strong>+32%</strong>
            </div>
          </div>
        </section>

        <section className="content-grid">
          {renderDashboardSection()}
        </section>
      </main>
    </div>
  )

  if (screen === 'profile') {
    return (
      <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="brand-block">
            <div className="brand-mark">D</div>
            <div>
              <h1>DMAUT</h1>
              <p>AI Automation</p>
            </div>
            <button
              type="button"
              className="collapse-toggle"
              onClick={() => setIsSidebarCollapsed((current) => !current)}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? '»' : '«'}
            </button>
          </div>

          <div className="user-panel">
            <span>Signed in as</span>
            <strong>{activeUser?.role || 'admin'}</strong>
          </div>

          <div className="workspace-card">
            <span className="workspace-label">Workspace health</span>
            <strong>12 campaigns live</strong>
            <small>2 need optimization</small>
          </div>

          <nav className="nav-list" aria-label="Main navigation">
            {navGroups.map((group) => (
              <div className="nav-group" key={group.label}>
                <span className="nav-group-label">{group.label}</span>
                {group.items.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={activeNav === item ? 'nav-item active' : 'nav-item'}
                    onClick={() => handleNavClick(item)}
                  >
                    <span className="nav-icon">{navIcons[item] || '•'}</span>
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          <div className="sidebar-tip">
            <span className="tip-label">AI assistant</span>
            <strong>Recommended next move</strong>
            <p>Review your AI campaign recommendations and optimize conversion opportunities before launch.</p>
          </div>
        </aside>

        <main className="main-panel">
          <header className="topbar">
            <div className="crumbs">
              <span>Account</span>
              <span className="separator">/</span>
              <span>Profile</span>
            </div>

            <div className="header-actions">
              <button type="button" className="ghost-btn" onClick={() => setScreen('app')}>Back to dashboard</button>
              <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
              <button type="button" className="primary-btn">Save changes</button>
            </div>
          </header>

          <section className="profile-hero panel-box">
            <div className="profile-avatar">AR</div>
            <div className="profile-summary">
              <span className="eyebrow profile-eyebrow">{activeUser?.role === 'admin' ? 'Admin user' : 'Team user'}</span>
              <h2>{profileName}</h2>
              <p>{profileTitle} • DMAUT AI workspace</p>
            </div>
            <span className="status-pill">Active</span>
          </section>

          <section className="profile-grid">
            <div className="panel-box profile-card">
              <div className="panel-header">
                <h3>Account details</h3>
                <button type="button" className="mini-btn">Edit</button>
              </div>

              <div className="detail-list">
                <div><span>Email</span><strong>{activeUser ? Object.keys(demoUsers).find((key) => demoUsers[key].name === profileName) : 'admin@dmaut.ai'}</strong></div>
                <div><span>Role</span><strong>{profileRole}</strong></div>
                <div><span>Team</span><strong>{activeUser?.role === 'admin' ? 'Growth marketing' : 'Campaign strategy'}</strong></div>
                <div><span>Timezone</span><strong>UTC+1</strong></div>
              </div>
            </div>

            <div className="panel-box profile-card">
              <div className="panel-header">
                <h3>AI permissions</h3>
                <button type="button" className="mini-btn">Manage</button>
              </div>

              <ul className="permission-list">
                {permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </div>
          </section>

          <section className="stats-row profile-stats">
            {profileStats.map((item) => (
              <article key={item.label} className="stat-card blue profile-stat-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </article>
            ))}
          </section>

          <section className="profile-visual-grid">
            <div className="panel-box chart-card">
              <div className="panel-header">
                <h3>Weekly performance</h3>
                <span className="chart-pill positive">+18.4%</span>
              </div>
              <TrendChart data={userTrendData} color="#2e67c4" />
            </div>

            <div className="panel-box chart-card">
              <div className="panel-header">
                <h3>Channel mix</h3>
                <span className="chart-pill neutral">AI-driven</span>
              </div>
              <BarChart data={channelData} color="#1a8a63" />
            </div>
          </section>

          <div className="chat-section">
            <ChatPanel title="User AI assistant" />
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isUserSession ? 'user-theme' : ''}`}>
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <h1>DMAUT</h1>
            <p>AI Automation</p>
          </div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={() => setIsSidebarCollapsed((current) => !current)}
            aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        <div className="user-panel">
          <span>Signed in as</span>
          <strong>admin</strong>
        </div>

        <div className="workspace-card">
          <span className="workspace-label">Workspace health</span>
          <strong>12 campaigns live</strong>
          <div className="mini-metrics">
            <div>
              <span>ROI</span>
              <strong>3.8x</strong>
            </div>
            <div>
              <span>AI score</span>
              <strong>94%</strong>
            </div>
          </div>
          <small>2 need optimization</small>
        </div>

        <nav className="nav-list" aria-label="Main navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-group-label">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={activeNav === item ? 'nav-item active' : 'nav-item'}
                  onClick={() => handleNavClick(item)}
                >
                  <span className="nav-icon">{navIcons[item] || '•'}</span>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-tip">
          <span className="tip-label">AI assistant</span>
          <strong>Recommended next move</strong>
          <p>Focus on the top audience clusters with the strongest AI-driven conversion potential.</p>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="crumbs">
            <span>Dashboard</span>
            <span className="separator">/</span>
            <span>{activeNav}</span>
          </div>

          <div className="header-actions">
            <button type="button" className="ghost-btn" onClick={() => setScreen('profile')}>{activeUser?.role === 'admin' ? 'Profile' : 'User profile'}</button>
            <button type="button" className="ghost-btn" onClick={handleLogout}>Logout</button>
            <button type="button" className="primary-btn">Launch AI</button>
          </div>
        </header>

        <div className="top-toolbar panel-box">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn active">Overview</button>
            <button type="button" className="toolbar-btn">Campaigns</button>
            <button type="button" className="toolbar-btn">Funnels</button>
          </div>
          <div className="toolbar-group right-group">
            <span className="toolbar-pill">Last 30 days</span>
            <button type="button" className="toolbar-btn accent">Generate report</button>
          </div>
        </div>

        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">DMAUT AI</span>
            <h2>{selectedOverview.heading}</h2>
            <p>{selectedOverview.copy}</p>

            <div className="hero-actions">
              {quickActions.map((action) => (
                <button key={action} type="button" className="hero-button">
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-summary">
            <div className="summary-card">
              <span>{selectedOverview.summaryLabel}</span>
              <strong>{selectedOverview.summaryValue}</strong>
              <small>{selectedOverview.summaryNote}</small>
            </div>
            <div className="summary-card muted">
              <span>{selectedOverview.secondaryLabel}</span>
              <strong>{selectedOverview.secondaryValue}</strong>
              <small>{selectedOverview.secondaryNote}</small>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-frame">
              <img src={heroIllustration} alt="DMAUT AI marketing dashboard illustration" />
            </div>
            <div className="mini-floating-card floating-top">
              <span>AI score</span>
              <strong>94%</strong>
            </div>
            <div className="mini-floating-card floating-bottom">
              <span>Revenue uplift</span>
              <strong>+32%</strong>
            </div>
          </div>
        </section>

        <section className="content-grid">
          {renderDashboardSection()}
        </section>
      </main>
    </div>
  )
}

export default App
