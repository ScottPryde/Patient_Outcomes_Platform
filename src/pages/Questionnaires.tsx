import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  mockQuestionnaires, mockQuestionnaireResponses, mockUpcomingQuestionnaires,
} from '../lib/mockData';
import { ClipboardList, CheckCircle2, Clock, Search, ChevronRight } from 'lucide-react';

const INSTRUMENTS = ['All', 'INQoL', 'PROMIS Fatigue', 'EQ-5D', 'FSHD PRO'];

const TIMELINE_MONTHS = [
  { label: 'Nov 25', entries: [{ id: 'q-fshd-prom', status: 'completed' as const }] },
  { label: 'Dec 25', entries: [{ id: 'q-promis-fatigue', status: 'completed' as const }, { id: 'q-eq5d', status: 'completed' as const }] },
  { label: 'Jan 26', entries: [{ id: 'q-inqol', status: 'completed' as const }] },
  { label: 'Feb 26', entries: [{ id: 'q-promis-fatigue', status: 'completed' as const }] },
  { label: 'Mar 26', entries: [{ id: 'q-fshd-prom', status: 'completed' as const }, { id: 'q-inqol', status: 'completed' as const }] },
  { label: 'Apr 26', entries: [{ id: 'q-fshd-prom', status: 'upcoming' as const }, { id: 'q-promis-fatigue', status: 'upcoming' as const }] },
];

export function Questionnaires() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [instrument, setInstrument] = useState('All');

  if (!user) return null;

  const available = mockQuestionnaires.filter((q) => q.status === 'active');
  const filtered = available.filter((q) => {
    const matchSearch = !search || q.title.toLowerCase().includes(search.toLowerCase());
    const matchInstrument = instrument === 'All' || q.title.includes(instrument);
    return matchSearch && matchInstrument;
  });

  const completedCount = mockQuestionnaireResponses.length;
  const upcomingCount = mockUpcomingQuestionnaires.length;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-1">PROM History</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          {completedCount} completed · {upcomingCount} upcoming · Instruments: INQoL, PROMIS Fatigue, EQ-5D-5L, FSHD PRO v2
        </p>
      </div>

      {/* Submission timeline */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Submission timeline</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TIMELINE_MONTHS.map((month) => (
            <div key={month.label} className="shrink-0 text-center min-w-[56px]">
              <p className="text-[10px] text-[var(--text-muted)] mb-2">{month.label}</p>
              <div className="space-y-1.5">
                {month.entries.map((entry, i) => (
                  <div
                    key={`${entry.id}-${i}`}
                    className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${entry.status === 'completed' ? 'bg-[var(--teal)] text-white' : 'bg-amber-100 border-2 border-amber-400'}`}
                    title={entry.id}
                  >
                    {entry.status === 'completed'
                      ? <CheckCircle2 className="w-4 h-4" />
                      : <Clock className="w-4 h-4 text-amber-600" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          <LegendItem colour="bg-[var(--teal)]" label="Completed" />
          <LegendItem colour="bg-amber-100 border-2 border-amber-400" label="Due soon" />
        </div>
      </div>

      {/* Bar chart stub — completed per month */}
      <div className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-5">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Submissions per month</h2>
        <div className="flex items-end gap-2 h-28">
          {([{ m: 'Nov', n: 1 }, { m: 'Dec', n: 2 }, { m: 'Jan', n: 1 }, { m: 'Feb', n: 1 }, { m: 'Mar', n: 2 }, { m: 'Apr', n: 0 }] as const).map(({ m, n }) => {
            const heightCls = n === 0 ? 'h-1' : n === 1 ? 'h-9' : 'h-[72px]';
            return (
              <div key={m} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full rounded-t-md ${n > 0 ? 'bg-[var(--teal)]' : 'bg-[var(--bg-surface)]'} ${heightCls}`} />
                <span className="text-[10px] text-[var(--text-muted)]">{m}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Due soon</h2>
        <div className="space-y-2">
          {mockUpcomingQuestionnaires.map((q) => (
            <Link
              key={q.id}
              to={`/health/prom-history/${q.questionnaireId}`}
              className="flex items-center justify-between p-4 bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] hover:border-[var(--teal)] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--teal)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{q.title}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Due {new Date(q.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ~{q.estimatedTime} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-[var(--badge-neutral-bg)] text-[var(--text-muted)]'}`}>
                  {q.priority === 'high' ? 'Due soon' : 'Upcoming'}
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Questionnaire library */}
      <div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">All instruments</h2>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
              <input
                type="search"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-token)] bg-[var(--bg-white)] focus:outline-none focus:ring-2 focus:ring-[var(--teal)]/40 w-36"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => setInstrument(inst)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${instrument === inst ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border-token)] text-[var(--text-muted)] hover:border-slate-300'}`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((q) => {
            const response = mockQuestionnaireResponses.find((r) => r.questionnaireId === q.id);
            return (
              <div key={q.id} className="bg-[var(--bg-white)] rounded-[var(--radius-card)] border border-[var(--border-token)] p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{q.title}</p>
                      <span className="text-[10px] bg-[var(--badge-neutral-bg)] text-[var(--text-muted)] px-1.5 py-0.5 rounded capitalize">
                        {q.frequency ?? q.schedulingType}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mb-2">{q.description}</p>
                    {response && (
                      <p className="text-xs text-teal-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Last completed {new Date(response.completedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {response.score != null && ` · Score: ${response.score}`}
                      </p>
                    )}
                  </div>
                  <Link
                    to={`/health/prom-history/${q.id}`}
                    className="shrink-0 text-xs bg-[var(--teal)] text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  >
                    Start now →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LegendItem({ colour, label }: { colour: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span className={`w-3 h-3 rounded-full ${colour}`} />
      {label}
    </div>
  );
}
