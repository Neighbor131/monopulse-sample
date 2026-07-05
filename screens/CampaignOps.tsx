import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Filter,
  Flag,
  ListChecks,
  MessageSquareText,
  Settings2,
  UsersRound,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { CALENDAR_CAMPAIGNS, GENERATED_REPORTS, OPS_TASKS, REPORT_TEMPLATE_SECTIONS } from '../data/campaignOps';
import { getType } from '../data/campaigns';

type ViewMode = 'calendar' | 'tasks' | 'reports';
type CalendarMode = 'week' | 'month';
type TimeWindowId = 'all' | 'morning' | 'afternoon' | 'evening' | 'custom';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  approval: 'Approval',
  scheduled: 'Scheduled',
  live: 'Live',
  ending: 'Ending soon',
  reporting: 'Reporting',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  blocked: 'Blocked',
  in_review: 'In review',
  in_progress: 'In progress',
  ready: 'Ready',
  done: 'Done',
};

const WEEK_DAYS = ['Mon 08', 'Tue 09', 'Wed 10', 'Thu 11', 'Fri 12', 'Sat 13', 'Sun 14'];
const MONTH_DAYS = Array.from({ length: 35 }, (_, index) => index + 1);
const TIME_WINDOWS: Array<{ id: TimeWindowId; label: string; from: string; to: string }> = [
  { id: 'all', label: 'All day', from: '00:00', to: '23:59' },
  { id: 'morning', label: 'Morning', from: '06:00', to: '11:59' },
  { id: 'afternoon', label: 'Afternoon', from: '12:00', to: '17:59' },
  { id: 'evening', label: 'Evening', from: '18:00', to: '23:59' },
  { id: 'custom', label: 'Custom', from: '09:00', to: '18:00' },
];

export default function CampaignOps() {
  const [view, setView] = useState<ViewMode>('calendar');

  const stats = useMemo(() => {
    const blocked = OPS_TASKS.filter((task) => task.status === 'blocked').length;
    const due = OPS_TASKS.filter((task) => task.due.includes('Today') || task.due === 'Overdue').length;
    const autoReports = GENERATED_REPORTS.filter((report) => report.status === 'ready' || report.status === 'scheduled').length;
    return { blocked, due, autoReports };
  }, []);

  return (
    <div className="mx-auto max-w-[1440px] px-8 py-7">
      <div className="flex items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-semibold tracking-tight">Campaign Ops</h1>
            <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
              Calendar · tasks · reports
            </span>
          </div>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-fg-secondary">
            Operational layer for campaign ownership, schedule visibility, launch blockers and automatic end-of-campaign reporting.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border px-3 py-2 text-[13px] font-semibold text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
            <Filter size={15} /> Brand filters
          </button>
          <button className="flex items-center gap-2 rounded-md px-3 py-2 text-[13px] font-semibold" style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}>
            <CalendarDays size={15} /> New ops item
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric icon={CalendarDays} label="Scheduled windows" value={String(CALENDAR_CAMPAIGNS.length)} detail="across 6 brands" />
        <Metric icon={AlertTriangle} label="Blocked tasks" value={String(stats.blocked)} detail="needs owner action" tone="danger" />
        <Metric icon={Clock3} label="Due today" value={String(stats.due)} detail="launch-critical work" tone="warning" />
        <Metric icon={FileText} label="Auto reports" value={String(stats.autoReports)} detail="ready or scheduled" tone="success" />
      </div>

      <div className="mt-6 flex items-center gap-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        {[
          { id: 'calendar', label: 'Calendar', icon: CalendarDays },
          { id: 'tasks', label: 'Ops tasks', icon: ListChecks },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = view === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as ViewMode)}
              className="flex items-center gap-2 border-b-2 px-3 py-2.5 text-[13px] font-semibold"
              style={{
                borderColor: active ? 'var(--accent)' : 'transparent',
                color: active ? 'var(--fg-primary)' : 'var(--fg-muted)',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {view === 'calendar' && <CalendarView />}
      {view === 'tasks' && <TasksView />}
      {view === 'reports' && <ReportsView />}
    </div>
  );
}

function CalendarView() {
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('week');
  const [timeWindow, setTimeWindow] = useState<TimeWindowId>('all');
  const [customFrom, setCustomFrom] = useState('09:00');
  const [customTo, setCustomTo] = useState('18:00');

  const activeWindow = TIME_WINDOWS.find((window) => window.id === timeWindow) ?? TIME_WINDOWS[0];
  const from = timeWindow === 'custom' ? customFrom : activeWindow.from;
  const to = timeWindow === 'custom' ? customTo : activeWindow.to;
  const visibleCampaigns = CALENDAR_CAMPAIGNS.filter((item) => isInTimeWindow(item.startTime, item.endTime, from, to));

  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div>
            <h2 className="text-[15px] font-semibold text-fg-primary">Campaign calendar</h2>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">Schedule windows, approvals, risk markers and reporting state. Showing {from} - {to}.</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SegmentedControl
              options={[
                { id: 'week', label: 'Week' },
                { id: 'month', label: 'Month' },
              ]}
              value={calendarMode}
              onChange={(value) => setCalendarMode(value as CalendarMode)}
            />
            <select
              value={timeWindow}
              onChange={(event) => setTimeWindow(event.target.value as TimeWindowId)}
              className="h-9 rounded-md border px-2 text-[12px] font-semibold outline-none"
              style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)', color: 'var(--fg-secondary)' }}
              aria-label="Calendar time window"
            >
              {TIME_WINDOWS.map((window) => (
                <option key={window.id} value={window.id}>{window.label}</option>
              ))}
            </select>
            {timeWindow === 'custom' && (
              <div className="flex items-center gap-1 rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
                <input aria-label="Start time" type="time" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="w-[82px] bg-transparent text-[12px] font-semibold outline-none" style={{ color: 'var(--fg-secondary)' }} />
                <span className="text-[11px] text-fg-muted">to</span>
                <input aria-label="End time" type="time" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="w-[82px] bg-transparent text-[12px] font-semibold outline-none" style={{ color: 'var(--fg-secondary)' }} />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3 text-[11.5px] text-fg-muted" style={{ borderColor: 'var(--border-subtle)' }}>
          <Legend color="var(--accent)" label="Live / clear" />
          <Legend color="var(--warning)" label="Warning" />
          <Legend color="var(--danger)" label="Blocked" />
          <span className="ml-auto font-semibold text-fg-secondary">{visibleCampaigns.length} visible campaign windows</span>
        </div>
        <div className="overflow-x-auto">
          {calendarMode === 'week' ? <WeeklyCalendar campaigns={visibleCampaigns} /> : <MonthlyCalendar campaigns={visibleCampaigns} />}
        </div>
      </section>

      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <h2 className="text-[15px] font-semibold text-fg-primary">Launch readiness</h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">What turns the calendar into an operator workflow.</p>
        <div className="mt-4 space-y-3">
          {[
            ['Week / month views', 'Operators can switch planning density', true],
            ['Desired time window', 'Filter all schedules by preset or custom hours', true],
            ['Task ownership', 'Every blocker has an assignee and due date', true],
            ['Report automation', 'End reports generated after campaign close', true],
            ['Drag rescheduling', 'Later: move windows directly on calendar', false],
          ].map(([title, desc, done]) => (
            <div key={String(title)} className="flex gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              {done ? <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> : <Clock3 size={16} style={{ color: 'var(--warning)' }} />}
              <div>
                <div className="text-[13px] font-semibold text-fg-primary">{title}</div>
                <div className="mt-0.5 text-[12px] text-fg-muted">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SegmentedControl({ options, value, onChange }: { options: Array<{ id: string; label: string }>; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex rounded-md border p-1" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className="h-7 rounded px-3 text-[12px] font-semibold transition-colors"
            style={{ background: active ? 'var(--accent)' : 'transparent', color: active ? 'var(--accent-fg)' : 'var(--fg-secondary)' }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function WeeklyCalendar({ campaigns }: { campaigns: typeof CALENDAR_CAMPAIGNS }) {
  return (
    <div className="min-w-[980px] p-5">
      <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="rounded-md px-2 py-2" style={{ background: 'var(--surface-2)' }}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {WEEK_DAYS.map((day) => {
          const dayCampaigns = campaigns.filter((item) => item.day === day);
          return (
            <div key={day} className="min-h-[360px] rounded-lg border p-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-base)' }}>
              {dayCampaigns.length > 0 ? (
                dayCampaigns.map((item) => <CalendarCard key={item.id} item={item} />)
              ) : (
                <EmptyCalendarCell />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyCalendar({ campaigns }: { campaigns: typeof CALENDAR_CAMPAIGNS }) {
  return (
    <div className="min-w-[980px] p-5">
      <div className="grid grid-cols-7 gap-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="rounded-md px-2 py-2" style={{ background: 'var(--surface-2)' }}>{day}</div>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-7 gap-2">
        {MONTH_DAYS.map((day) => {
          const dayCampaigns = campaigns.filter((item) => item.monthDay === day);
          return (
            <div key={day} className="min-h-[128px] rounded-lg border p-2" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-base)' }}>
              <div className="mb-2 text-[11px] font-semibold text-fg-muted">{day}</div>
              {dayCampaigns.slice(0, 2).map((item) => <CompactCalendarCard key={item.id} item={item} />)}
              {dayCampaigns.length > 2 && <div className="mt-1 text-[11px] font-semibold text-fg-muted">+{dayCampaigns.length - 2} more</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmptyCalendarCell() {
  return (
    <div className="flex h-full min-h-[120px] items-center justify-center rounded-md border border-dashed text-[11px] font-semibold text-fg-muted" style={{ borderColor: 'var(--border-subtle)' }}>
      No windows
    </div>
  );
}

function TasksView() {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="border-b px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-[15px] font-semibold text-fg-primary">Ops task board</h2>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">Jira-like task ownership for launch, risk, backend and finance work.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="px-5 py-3">Task</th>
                <th className="px-3 py-3">Team</th>
                <th className="px-3 py-3">Owner</th>
                <th className="px-3 py-3">Due</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {OPS_TASKS.map((task) => (
                <tr key={task.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="px-5 py-4">
                    <div className="text-[13.5px] font-semibold text-fg-primary">{task.title}</div>
                    <div className="mt-1 text-[11.5px] text-fg-muted">{task.campaignId}{task.blocker ? ` · ${task.blocker}` : ''}</div>
                  </td>
                  <td className="px-3 py-4"><Pill>{task.team}</Pill></td>
                  <td className="px-3 py-4 text-[12.5px] text-fg-secondary">{task.owner}</td>
                  <td className="px-3 py-4 text-[12.5px] text-fg-secondary">{task.due}</td>
                  <td className="px-3 py-4"><Priority priority={task.priority} /></td>
                  <td className="px-5 py-4"><TaskStatus status={task.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <h2 className="text-[15px] font-semibold text-fg-primary">Task detail pattern</h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">Fields the PO asked for in Jira-like operations.</p>
        <div className="mt-4 space-y-2">
          {['Assignee and team', 'Due date and launch impact', 'Comments / internal notes', 'Blocking dependency', 'Audit event when resolved'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[12.5px] text-fg-secondary">
              <MessageSquareText size={14} style={{ color: 'var(--accent)' }} />
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-fg-primary">Report template</h2>
            <p className="mt-0.5 text-[12.5px] text-fg-muted">Configure what auto-generates when a campaign ends.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md border px-3 py-2 text-[12.5px] font-semibold text-fg-secondary" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
            <Settings2 size={14} /> Edit template
          </button>
        </div>
        <div className="mt-4 divide-y rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
          {REPORT_TEMPLATE_SECTIONS.map((section) => (
            <div key={section.id} className="flex items-center justify-between gap-4 px-4 py-3" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <div className="text-[13px] font-semibold text-fg-primary">{section.label}</div>
                <div className="mt-0.5 text-[11.5px] text-fg-muted">Owner: {section.owner}</div>
              </div>
              <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: section.enabled ? 'var(--accent-bg)' : 'var(--surface-3)', color: section.enabled ? 'var(--accent)' : 'var(--fg-muted)' }}>
                {section.enabled ? 'Included' : 'Optional'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border p-5" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
        <h2 className="text-[15px] font-semibold text-fg-primary">Generated reports</h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">Campaign end reports for CRM, casino and finance review.</p>
        <div className="mt-4 space-y-3">
          {GENERATED_REPORTS.map((report) => (
            <div key={report.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-2)' }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13.5px] font-semibold text-fg-primary">{report.campaignName}</div>
                  <div className="mt-0.5 text-[11.5px] text-fg-muted">{report.generatedAt}</div>
                </div>
                <TaskStatus status={report.status === 'ready' ? 'done' : report.status === 'scheduled' ? 'ready' : 'in_progress'} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                <ReportMetric label="ROI" value={report.roi} />
                <ReportMetric label="Cost" value={report.rewardCost} />
                <ReportMetric label="Audience" value={report.audienceReached} />
                <ReportMetric label="Risk events" value={String(report.riskEvents)} />
              </div>
              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-[12.5px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>
                <Download size={14} /> Export report
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function CalendarCard({ item }: { item: (typeof CALENDAR_CAMPAIGNS)[number] }) {
  const type = getType(item.type);
  const TypeIcon = type.icon;
  const color = item.risk === 'blocked' ? 'var(--danger)' : item.risk === 'warning' ? 'var(--warning)' : 'var(--accent)';
  return (
    <div className="mb-2 rounded-lg border p-2.5" style={{ borderColor: color, background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-2">
        <TypeIcon size={14} style={{ color }} />
        <span className="truncate text-[12.5px] font-semibold text-fg-primary">{item.name}</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-fg-muted">{item.brand}</span>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{STATUS_LABELS[item.status]}</span>
      </div>
      <div className="mt-1 text-[11px] text-fg-muted">{item.startTime} - {item.endTime}</div>
      <div className="mt-1 text-[11px] text-fg-muted">{item.start} {'->'} {item.end}</div>
    </div>
  );
}

function CompactCalendarCard({ item }: { item: (typeof CALENDAR_CAMPAIGNS)[number] }) {
  const color = item.risk === 'blocked' ? 'var(--danger)' : item.risk === 'warning' ? 'var(--warning)' : 'var(--accent)';
  return (
    <div className="mb-1 rounded-md border px-2 py-1.5" style={{ borderColor: color, background: 'var(--surface-1)' }}>
      <div className="truncate text-[11.5px] font-semibold text-fg-primary">{item.name}</div>
      <div className="mt-0.5 flex items-center justify-between gap-2 text-[10.5px] text-fg-muted">
        <span>{item.brand}</span>
        <span>{item.startTime}</span>
      </div>
    </div>
  );
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function isInTimeWindow(start: string, end: string, from: string, to: string) {
  const eventStart = timeToMinutes(start);
  const eventEnd = timeToMinutes(end);
  const windowStart = timeToMinutes(from);
  const windowEnd = timeToMinutes(to);
  return eventStart <= windowEnd && eventEnd >= windowStart;
}

function Metric({ icon: Icon, label, value, detail, tone = 'default' }: { icon: typeof CalendarDays; label: string; value: string; detail: string; tone?: 'default' | 'danger' | 'warning' | 'success' }) {
  const color = tone === 'danger' ? 'var(--danger)' : tone === 'warning' ? 'var(--warning)' : tone === 'success' ? 'var(--accent)' : 'var(--fg-secondary)';
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-subtle)', background: 'var(--surface-1)' }}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-fg-muted">
        <Icon size={15} style={{ color }} />
        {label}
      </div>
      <div className="mt-3 text-[24px] font-semibold text-fg-primary">{value}</div>
      <div className="mt-1 text-[12px] text-fg-muted">{detail}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: color }} />{label}</span>;
}

function Pill({ children }: { children: string }) {
  return <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--surface-3)', color: 'var(--fg-secondary)' }}>{children}</span>;
}

function Priority({ priority }: { priority: string }) {
  const color = priority === 'critical' ? 'var(--danger)' : priority === 'high' ? 'var(--warning)' : 'var(--fg-secondary)';
  return <span className="inline-flex items-center gap-1 text-[12px] font-semibold capitalize" style={{ color }}><Flag size={12} />{priority}</span>;
}

function TaskStatus({ status }: { status: string }) {
  const tone = status === 'blocked' ? 'var(--danger)' : status === 'in_review' || status === 'in_progress' ? 'var(--warning)' : status === 'done' ? 'var(--accent)' : 'var(--fg-secondary)';
  return <span className="rounded px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--surface-3)', color: tone }}>{TASK_STATUS_LABELS[status] ?? status}</span>;
}

function ReportMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md px-3 py-2" style={{ background: 'var(--bg-base)' }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="mt-1 font-mono text-[13px] text-fg-primary">{value}</div>
    </div>
  );
}
