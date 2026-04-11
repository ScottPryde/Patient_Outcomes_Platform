import { MyObservations } from '../components/observations/MyObservations';

export function MyObservationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Observations</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track and monitor your health observations over time
        </p>
      </div>

      <MyObservations />
    </div>
  );
}
